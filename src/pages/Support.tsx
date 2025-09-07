import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Mail, Phone, Users, HelpCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AxanarCTA from "@/components/AxanarCTA";

const Support = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="p-8">
        <h1 className="text-4xl font-bold">Support Page Test</h1>
        <p className="text-xl mt-4">If you can see this, the component is rendering.</p>
      </div>
    </div>
  );
};

export default Support;
