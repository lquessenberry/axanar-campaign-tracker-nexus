import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { FileSpreadsheet, Upload, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

interface ImportedDonor {
  'First name'?: string;
  'Last name'?: string;
  'Email address - other'?: string;
  'Email status - other'?: string;
  'Email permission status - other'?: string;
  'Phone - home'?: string;
  'Street address line 1 - Home'?: string;
  'City - Home'?: string;
  'State/Province - Home'?: string;
  'Zip/Postal Code - Home'?: string;
  'Country - Home'?: string;
  'Email Lists'?: string;
  'Source Name'?: string;
  'Created At'?: string;
  'Updated At'?: string;
  [key: string]: any;
}

const DonorImportSection = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [parsedData, setParsedData] = useState<ImportedDonor[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as ImportedDonor[];

      // Validate required fields
      const validRecords = jsonData.filter(record => 
        record['Email address - other'] && 
        record['Email address - other'].toString().includes('@')
      );

      if (validRecords.length === 0) {
        toast.error('No valid records found. Please ensure "Email address - other" column contains valid emails.');
        return;
      }

      if (validRecords.length < jsonData.length) {
        toast.warning(`${jsonData.length - validRecords.length} records skipped due to missing or invalid email addresses.`);
      }

      setParsedData(validRecords);
      setShowPreview(true);
      toast.success(`Parsed ${validRecords.length} valid records from ${file.name}`);
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error('Failed to parse Excel file. Please check the format.');
    }
  };

  const processImport = async () => {
    if (parsedData.length === 0) return;

    setIsImporting(true);
    setImportProgress(0);

    try {
      const batchSize = 50;
      const batches = [];
      
      for (let i = 0; i < parsedData.length; i += batchSize) {
        batches.push(parsedData.slice(i, i + batchSize));
      }

      let processedCount = 0;
      let updatedCount = 0;
      let createdCount = 0;
      
      for (const batch of batches) {
        const result = await processBatch(batch);
        updatedCount += result.updated;
        createdCount += result.created;
        
        processedCount += batch.length;
        setImportProgress((processedCount / parsedData.length) * 100);
      }

      toast.success(`Import completed! Created: ${createdCount}, Updated: ${updatedCount} records`);
      setParsedData([]);
      setShowPreview(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Import failed. Please try again.');
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  const processBatch = async (batch: ImportedDonor[]) => {
    let created = 0;
    let updated = 0;

    for (const record of batch) {
      const email = record['Email address - other'];
      if (!email) continue;

      try {
        // Check if donor exists
        const { data: existingDonor } = await supabase
          .from('donors')
          .select('*')
          .eq('email', email.toLowerCase().trim())
          .single();

        const donorData = {
          email: email.toLowerCase().trim(),
          first_name: record['First name'] || null,
          last_name: record['Last name'] || null,
          full_name: record['First name'] && record['Last name'] 
            ? `${record['First name']} ${record['Last name']}` 
            : record['First name'] || record['Last name'] || null,
          donor_name: record['First name'] && record['Last name'] 
            ? `${record['First name']} ${record['Last name']}` 
            : record['First name'] || record['Last name'] || null,
          email_status: record['Email status - other'] || null,
          email_permission_status: record['Email permission status - other'] || null,
          email_lists: record['Email Lists'] || null,
          source_name: record['Source Name'] || null,
          created_at: record['Created At'] ? new Date(record['Created At']).toISOString() : undefined,
          updated_at: record['Updated At'] ? new Date(record['Updated At']).toISOString() : new Date().toISOString(),
        };

        let donorId;

        if (existingDonor) {
          // Update existing donor
          await supabase
            .from('donors')
            .update(donorData)
            .eq('id', existingDonor.id);
          donorId = existingDonor.id;
          updated++;
        } else {
          // Create new donor
          const { data: newDonor } = await supabase
            .from('donors')
            .insert(donorData)
            .select('id')
            .single();
          donorId = newDonor?.id;
          created++;
        }

        // Handle address data if available
        if (donorId && (record['Street address line 1 - Home'] || record['City - Home'])) {
          const addressData = {
            donor_id: donorId,
            address1: record['Street address line 1 - Home'] || null,
            city: record['City - Home'] || null,
            state: record['State/Province - Home'] || null,
            postal_code: record['Zip/Postal Code - Home'] || null,
            country: record['Country - Home'] || null,
            phone: record['Phone - home'] || null,
            is_primary: true,
          };

          // Check if address exists
          const { data: existingAddress } = await supabase
            .from('addresses')
            .select('*')
            .eq('donor_id', donorId)
            .eq('is_primary', true)
            .single();

          if (existingAddress) {
            await supabase
              .from('addresses')
              .update(addressData)
              .eq('id', existingAddress.id);
          } else {
            await supabase
              .from('addresses')
              .insert(addressData);
          }
        }

      } catch (error) {
        console.error(`Error processing record for ${email}:`, error);
      }
    }

    return { created, updated };
  };

  const resetImport = () => {
    setParsedData([]);
    setShowPreview(false);
    setImportProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Import Donor Data
        </CardTitle>
        <CardDescription>
          Import donor information from Excel/XLS files with donation dates and amounts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Expected columns: "First name", "Last name", "Email address - other" (required), 
            "Email status - other", "Email permission status - other", "Phone - home", 
            "Street address line 1 - Home", "City - Home", "State/Province - Home", 
            "Zip/Postal Code - Home", "Country - Home", "Email Lists", "Source Name", 
            "Created At", "Updated At"
          </AlertDescription>
        </Alert>

        {!showPreview && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="donor-file">Select Excel File</Label>
              <Input
                id="donor-file"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                ref={fileInputRef}
                disabled={isImporting}
              />
            </div>
          </div>
        )}

        {showPreview && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Parsed {parsedData.length} records. Preview of first 5 rows:
              </AlertDescription>
            </Alert>

            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-sm border border-border rounded-md">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-2 py-1 text-left border-r border-border">First Name</th>
                    <th className="px-2 py-1 text-left border-r border-border">Last Name</th>
                    <th className="px-2 py-1 text-left border-r border-border">Email</th>
                    <th className="px-2 py-1 text-left border-r border-border">Phone</th>
                    <th className="px-2 py-1 text-left border-r border-border">City</th>
                    <th className="px-2 py-1 text-left border-r border-border">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 5).map((row, index) => (
                    <tr key={index} className="border-t border-border">
                      <td className="px-2 py-1 border-r border-border">
                        {row['First name'] || '-'}
                      </td>
                      <td className="px-2 py-1 border-r border-border">
                        {row['Last name'] || '-'}
                      </td>
                      <td className="px-2 py-1 border-r border-border">
                        {row['Email address - other'] || '-'}
                      </td>
                      <td className="px-2 py-1 border-r border-border">
                        {row['Phone - home'] || '-'}
                      </td>
                      <td className="px-2 py-1 border-r border-border">
                        {row['City - Home'] || '-'}
                      </td>
                      <td className="px-2 py-1 border-r border-border">
                        {row['Source Name'] || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {isImporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Importing records...</span>
                  <span>{Math.round(importProgress)}%</span>
                </div>
                <Progress value={importProgress} className="w-full" />
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={processImport}
                disabled={isImporting}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isImporting ? 'Importing...' : `Import ${parsedData.length} Records`}
              </Button>
              <Button 
                variant="outline" 
                onClick={resetImport}
                disabled={isImporting}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DonorImportSection;