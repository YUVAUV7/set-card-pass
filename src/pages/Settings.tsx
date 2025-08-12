import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const setCanonical = (href: string) => {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
};

const Settings: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const pageTitle = useMemo(() => "Profile Settings | SET Card Game", []);
  const pageDescription = useMemo(
    () => "Edit your profile: update display name and upload avatar for the SET Card Game.",
    []
  );

  useEffect(() => {
    // SEO basics for SPA
    document.title = pageTitle;
    setCanonical(window.location.href);
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", pageDescription);
  }, [pageTitle, pageDescription]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        // If profile doesn't exist, create a minimal one
        if ((error as any).code === "PGRST116" || (error as any).details?.includes("No rows")) {
          const { error: insertErr } = await supabase.from("profiles").insert({
            user_id: user.id,
            username: user.email ?? "Player",
          });
          if (insertErr) {
            toast({ title: "Profile", description: "Couldn't auto-create profile.", variant: "destructive" });
          } else {
            setUsername(user.email ?? "Player");
          }
        } else {
          toast({ title: "Profile", description: "Failed to load profile.", variant: "destructive" });
        }
        return;
      }

      if (data) {
        setUsername(data.username ?? user.email ?? "Player");
        setAvatarUrl(data.avatar_url ?? "");
      } else {
        // No row returned; create one
        const { error: insertErr } = await supabase.from("profiles").insert({
          user_id: user.id,
          username: user.email ?? "Player",
        });
        if (!insertErr) setUsername(user.email ?? "Player");
      }
    };

    if (!authLoading && user) fetchProfile();
  }, [authLoading, user, toast]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("user_id", user.id);

    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated", description: "Your display name has been saved." });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!user) return;
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      const ext = file.name.split('.').pop() || 'png';
      const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true, contentType: file.type, cacheControl: '3600' });

      if (uploadError) throw uploadError;

      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = pub?.publicUrl ?? '';

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast({ title: 'Avatar updated', description: 'Your display picture has been updated.' });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err?.message ?? 'Unable to upload image.', variant: 'destructive' });
    } finally {
      setUploading(false);
      // reset the input value so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile…</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-background p-4">
      <section className="max-w-2xl mx-auto">
        <Card className="backdrop-blur-sm bg-background/95 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Profile Settings</CardTitle>
            <CardDescription>Manage your display name and avatar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 shadow-md">
                <AvatarImage src={avatarUrl} alt={`${username || 'Player'} avatar`} loading="lazy" />
                <AvatarFallback>{(username || 'P').slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <label className="text-sm text-muted-foreground">Display picture</label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block text-sm"
                  />
                  <Button variant="secondary" disabled>
                    {uploading ? 'Uploading…' : 'Upload'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">PNG/JPG, up to ~2MB recommended.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm text-muted-foreground">Display name</label>
              <div className="flex gap-2">
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your name"
                />
                <Button onClick={handleSave} disabled={saving || !username.trim()}>
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Settings;
