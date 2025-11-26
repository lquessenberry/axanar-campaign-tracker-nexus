-- Create address change log table
CREATE TABLE IF NOT EXISTS public.address_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES public.donors(id) ON DELETE CASCADE,
  address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'set_primary')),
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  changed_by_admin_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.address_change_log ENABLE ROW LEVEL SECURITY;

-- Admins can view all address logs
CREATE POLICY "Admins can view all address logs"
  ON public.address_change_log
  FOR SELECT
  USING (check_current_user_is_admin());

-- Users can view their own address logs
CREATE POLICY "Users can view their own address logs"
  ON public.address_change_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM donors d
      WHERE d.id = address_change_log.donor_id
      AND d.auth_user_id = auth.uid()
    )
  );

-- System can insert logs
CREATE POLICY "System can insert address logs"
  ON public.address_change_log
  FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_address_change_log_donor ON public.address_change_log(donor_id);
CREATE INDEX idx_address_change_log_address ON public.address_change_log(address_id);
CREATE INDEX idx_address_change_log_created ON public.address_change_log(created_at DESC);

-- Function to log address changes
CREATE OR REPLACE FUNCTION log_address_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_changed_fields TEXT[];
  v_old_values JSONB;
  v_new_values JSONB;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO address_change_log (
      donor_id,
      address_id,
      action,
      new_values,
      metadata
    ) VALUES (
      NEW.donor_id,
      NEW.id,
      'created',
      to_jsonb(NEW),
      jsonb_build_object('operation', 'INSERT')
    );
    RETURN NEW;
  
  ELSIF TG_OP = 'UPDATE' THEN
    -- Detect changed fields
    v_changed_fields := ARRAY[]::TEXT[];
    v_old_values := jsonb_build_object();
    v_new_values := jsonb_build_object();
    
    IF OLD.address1 IS DISTINCT FROM NEW.address1 THEN
      v_changed_fields := array_append(v_changed_fields, 'address1');
      v_old_values := v_old_values || jsonb_build_object('address1', OLD.address1);
      v_new_values := v_new_values || jsonb_build_object('address1', NEW.address1);
    END IF;
    
    IF OLD.address2 IS DISTINCT FROM NEW.address2 THEN
      v_changed_fields := array_append(v_changed_fields, 'address2');
      v_old_values := v_old_values || jsonb_build_object('address2', OLD.address2);
      v_new_values := v_new_values || jsonb_build_object('address2', NEW.address2);
    END IF;
    
    IF OLD.city IS DISTINCT FROM NEW.city THEN
      v_changed_fields := array_append(v_changed_fields, 'city');
      v_old_values := v_old_values || jsonb_build_object('city', OLD.city);
      v_new_values := v_new_values || jsonb_build_object('city', NEW.city);
    END IF;
    
    IF OLD.state IS DISTINCT FROM NEW.state THEN
      v_changed_fields := array_append(v_changed_fields, 'state');
      v_old_values := v_old_values || jsonb_build_object('state', OLD.state);
      v_new_values := v_new_values || jsonb_build_object('state', NEW.state);
    END IF;
    
    IF OLD.postal_code IS DISTINCT FROM NEW.postal_code THEN
      v_changed_fields := array_append(v_changed_fields, 'postal_code');
      v_old_values := v_old_values || jsonb_build_object('postal_code', OLD.postal_code);
      v_new_values := v_new_values || jsonb_build_object('postal_code', NEW.postal_code);
    END IF;
    
    IF OLD.country IS DISTINCT FROM NEW.country THEN
      v_changed_fields := array_append(v_changed_fields, 'country');
      v_old_values := v_old_values || jsonb_build_object('country', OLD.country);
      v_new_values := v_new_values || jsonb_build_object('country', NEW.country);
    END IF;
    
    IF OLD.phone IS DISTINCT FROM NEW.phone THEN
      v_changed_fields := array_append(v_changed_fields, 'phone');
      v_old_values := v_old_values || jsonb_build_object('phone', OLD.phone);
      v_new_values := v_new_values || jsonb_build_object('phone', NEW.phone);
    END IF;
    
    IF OLD.is_primary IS DISTINCT FROM NEW.is_primary THEN
      v_changed_fields := array_append(v_changed_fields, 'is_primary');
      v_old_values := v_old_values || jsonb_build_object('is_primary', OLD.is_primary);
      v_new_values := v_new_values || jsonb_build_object('is_primary', NEW.is_primary);
    END IF;
    
    -- Only log if something actually changed
    IF array_length(v_changed_fields, 1) > 0 THEN
      INSERT INTO address_change_log (
        donor_id,
        address_id,
        action,
        old_values,
        new_values,
        changed_fields,
        metadata
      ) VALUES (
        NEW.donor_id,
        NEW.id,
        CASE WHEN 'is_primary' = ANY(v_changed_fields) AND NEW.is_primary = true 
          THEN 'set_primary' 
          ELSE 'updated' 
        END,
        v_old_values,
        v_new_values,
        v_changed_fields,
        jsonb_build_object(
          'operation', 'UPDATE',
          'total_fields_changed', array_length(v_changed_fields, 1)
        )
      );
    END IF;
    
    RETURN NEW;
  
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO address_change_log (
      donor_id,
      address_id,
      action,
      old_values,
      metadata
    ) VALUES (
      OLD.donor_id,
      OLD.id,
      'deleted',
      to_jsonb(OLD),
      jsonb_build_object('operation', 'DELETE')
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS log_address_changes_trigger ON public.addresses;
CREATE TRIGGER log_address_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.addresses
  FOR EACH ROW
  EXECUTE FUNCTION log_address_change();