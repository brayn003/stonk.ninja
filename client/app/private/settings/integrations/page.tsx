import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// import { Separator } from "@/components/ui/separator";
import { KiteForm } from "./_components/kite-form";

export default function SettingsAccountPage() {
  return (
    <div className="space-y-6">
      {/* <div>
        <h3 className="text-lg font-medium">Account</h3>
        <p className="text-sm text-muted-foreground">
          Update your account settings. Set your preferred language and timezone.
        </p>
      </div>
      <Separator /> */}
      <Card>
        <CardHeader>
          <CardTitle>Kite Integration</CardTitle>
          <CardDescription>Connect your Kite trading account</CardDescription>
        </CardHeader>
        <CardContent>
          <KiteForm />
        </CardContent>
      </Card>
    </div>
  );
}
