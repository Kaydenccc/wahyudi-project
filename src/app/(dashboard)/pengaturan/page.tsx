"use client";

import { useState, useEffect, useRef } from "react";
import {
  User,
  Building2,
  Shield,
  Save,
  UserPlus,
  MoreVertical,
  Upload,
  X,
  ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUsers } from "@/hooks/use-users";
import { useClubSettings } from "@/hooks/use-settings";
import { useBranding } from "@/hooks/use-branding";
import { useSession } from "@/hooks/use-session";

const tabs = [
  { id: "profil", label: "Profil", icon: User },
  { id: "klub", label: "Klub", icon: Building2 },
  { id: "users", label: "Manajemen Pengguna", icon: Shield },
];

const roleColors: Record<string, string> = {
  Admin: "bg-red-500/10 text-red-400 border-red-500/20",
  Pelatih: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Atlet: "bg-green-500/10 text-green-400 border-green-500/20",
  "Ketua Klub": "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export default function PengaturanPage() {
  const [activeTab, setActiveTab] = useState("profil");
  const { user: sessionUser, refresh: refreshSession } = useSession();
  const { users, isLoading: usersLoading, mutate: mutateUsers } = useUsers();
  const { settings, isLoading: settingsLoading, mutate: mutateSettings } = useClubSettings();
  const { mutate: mutateBranding } = useBranding();
  const [saving, setSaving] = useState(false);

  // Logo & favicon
  const [clubLogo, setClubLogo] = useState("");
  const [clubFavicon, setClubFavicon] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [faviconPreview, setFaviconPreview] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // Profile form state
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profilePassword, setProfilePassword] = useState("");

  // Club settings form state
  const [clubName, setClubName] = useState("");
  const [clubPhone, setClubPhone] = useState("");
  const [clubAddress, setClubAddress] = useState("");
  const [clubEmail, setClubEmail] = useState("");
  const [clubWebsite, setClubWebsite] = useState("");
  const [clubHistory, setClubHistory] = useState("");
  const [clubVision, setClubVision] = useState("");
  const [clubMission, setClubMission] = useState("");

  // Sponsors state
  const [sponsors, setSponsors] = useState<{ _id?: string; name: string; logo: string; website?: string }[]>([]);
  const [showSponsorDialog, setShowSponsorDialog] = useState(false);
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorLogo, setSponsorLogo] = useState("");
  const [sponsorLogoPreview, setSponsorLogoPreview] = useState("");
  const [sponsorWebsite, setSponsorWebsite] = useState("");
  const [uploadingSponsorLogo, setUploadingSponsorLogo] = useState(false);
  const sponsorLogoInputRef = useRef<HTMLInputElement>(null);

  // User management dialog state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showBanConfirm, setShowBanConfirm] = useState<any>(null);
  const [dialogSaving, setDialogSaving] = useState(false);

  // Add/Edit user form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState("Atlet");
  const [formPassword, setFormPassword] = useState("");

  // Sync profile from session user
  useEffect(() => {
    if (sessionUser) {
      setProfileName(sessionUser.name || "");
      setProfileEmail(sessionUser.email || "");
    }
  }, [sessionUser]);

  // Sync club settings when loaded
  useEffect(() => {
    if (settings) {
      setClubName(settings.clubName || "");
      setClubPhone(settings.phone || "");
      setClubAddress(settings.address || "");
      setClubEmail(settings.email || "");
      setClubWebsite(settings.website || "");
      setClubLogo(settings.logo || "");
      setClubFavicon(settings.favicon || "");
      setLogoPreview(settings.logo || "");
      setFaviconPreview(settings.favicon || "");
      setClubHistory(settings.history || "");
      setClubVision(settings.vision || "");
      setClubMission(settings.mission || "");
      setSponsors(settings.sponsors || []);
    }
  }, [settings]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
          phone: profilePhone,
          ...(profilePassword ? { password: profilePassword } : {}),
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan profil");
      toast.success("Profil berhasil disimpan!");
      refreshSession();
      setProfilePassword("");
    } catch {
      toast.error("Gagal menyimpan profil");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadFile = async (
    file: File,
    setUploading: (v: boolean) => void,
    setUrl: (v: string) => void,
    setPreview: (v: string) => void
  ) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Gagal mengunggah file");
      const data = await res.json();
      setUrl(data.url);
      setPreview(data.url);
    } catch {
      toast.error("Gagal mengunggah file");
    } finally {
      setUploading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }
    handleUploadFile(file, setUploadingLogo, setClubLogo, setLogoPreview);
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }
    handleUploadFile(file, setUploadingFavicon, setClubFavicon, setFaviconPreview);
  };

  const handleSponsorLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }
    handleUploadFile(file, setUploadingSponsorLogo, setSponsorLogo, setSponsorLogoPreview);
  };

  const handleAddSponsor = () => {
    if (!sponsorName.trim() || !sponsorLogo) {
      toast.error("Nama dan logo sponsor wajib diisi");
      return;
    }
    setSponsors((prev) => [...prev, { name: sponsorName.trim(), logo: sponsorLogo, website: sponsorWebsite.trim() || "" }]);
    setSponsorName("");
    setSponsorLogo("");
    setSponsorLogoPreview("");
    setSponsorWebsite("");
    setShowSponsorDialog(false);
    toast.success("Sponsor ditambahkan! Klik Simpan untuk menyimpan perubahan.");
  };

  const handleRemoveSponsor = (index: number) => {
    setSponsors((prev) => prev.filter((_, i) => i !== index));
    toast.success("Sponsor dihapus! Klik Simpan untuk menyimpan perubahan.");
  };

  const handleSaveClub = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubName,
          phone: clubPhone,
          address: clubAddress,
          email: clubEmail,
          website: clubWebsite,
          logo: clubLogo,
          favicon: clubFavicon,
          history: clubHistory,
          vision: clubVision,
          mission: clubMission,
          sponsors: sponsors.map((s) => ({ name: s.name, logo: s.logo, website: s.website || "" })),
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan pengaturan klub");
      toast.success("Pengaturan berhasil disimpan!");
      mutateSettings();
      mutateBranding();
    } catch {
      toast.error("Gagal menyimpan pengaturan klub");
    } finally {
      setSaving(false);
    }
  };

  const openAddDialog = () => {
    setFormName("");
    setFormEmail("");
    setFormRole("Atlet");
    setFormPassword("");
    setEditingUser(null);
    setShowAddDialog(true);
  };

  const openEditDialog = (user: any) => {
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormPassword("");
    setEditingUser(user);
    setShowAddDialog(true);
  };

  const handleSaveUser = async () => {
    setDialogSaving(true);
    try {
      if (editingUser) {
        const body: Record<string, string> = {
          name: formName,
          email: formEmail,
          role: formRole,
        };
        if (formPassword) body.password = formPassword;

        const res = await fetch(`/api/users/${editingUser._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Gagal mengupdate user");
        toast.success("User berhasil diupdate!");
      } else {
        if (!formPassword || formPassword.length < 8) {
          toast.error("Password minimal 8 karakter");
          setDialogSaving(false);
          return;
        }
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            email: formEmail,
            role: formRole,
            password: formPassword,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Gagal menambahkan user");
        }
        toast.success("User berhasil ditambahkan!");
      }
      setShowAddDialog(false);
      mutateUsers();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan user");
    } finally {
      setDialogSaving(false);
    }
  };

  const getNextStatus = (currentStatus: string) => {
    if (currentStatus === "Menunggu") return "Aktif";
    if (currentStatus === "Aktif") return "Non-Aktif";
    return "Aktif";
  };

  const getStatusActionLabel = (status: string) => {
    if (status === "Menunggu") return "Setujui";
    if (status === "Aktif") return "Nonaktifkan";
    return "Aktifkan";
  };

  const handleBanUser = async (user: any) => {
    setDialogSaving(true);
    try {
      const newStatus = getNextStatus(user.status);
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status user");
      const label = user.status === "Menunggu" ? "disetujui" : newStatus === "Non-Aktif" ? "dinonaktifkan" : "diaktifkan";
      toast.success(`User berhasil ${label}!`);
      setShowBanConfirm(null);
      mutateUsers();
    } catch {
      toast.error("Gagal mengubah status user");
    } finally {
      setDialogSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan"
        description="Kelola profil, pengaturan klub, dan akses pengguna Anda."
      />

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
              activeTab === tab.id
                ? "bg-primary/10 text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "profil" && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Pengaturan Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 border-4 border-primary/30">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {sessionUser?.name
                    ? sessionUser.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                    : "??"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">{sessionUser?.name}</p>
                <p className="text-xs text-muted-foreground">{sessionUser?.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>No. Telepon</Label>
                <Input
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={sessionUser?.role || ""}
                  disabled
                  className="bg-secondary border-border opacity-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Password Baru (kosongkan jika tidak ingin mengubah)</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={profilePassword}
                onChange={(e) => setProfilePassword(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "klub" && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Pengaturan Klub</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {settingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Memuat...</div>
              </div>
            ) : (
              <>
                {/* Logo & Favicon Upload */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b border-border">
                  {/* Logo Upload */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Logo Sistem</Label>
                    <p className="text-xs text-muted-foreground">
                      Ditampilkan di sidebar dan header. PNG/JPG, maks 5MB.
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-secondary/50 shrink-0">
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="Logo"
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoChange}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => logoInputRef.current?.click()}
                          disabled={uploadingLogo}
                        >
                          <Upload className="h-3.5 w-3.5 mr-1.5" />
                          {uploadingLogo ? "Mengunggah..." : "Unggah Logo"}
                        </Button>
                        {clubLogo && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setClubLogo("");
                              setLogoPreview("");
                            }}
                          >
                            <X className="h-3.5 w-3.5 mr-1.5" />
                            Hapus Logo
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Favicon Upload */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Favicon</Label>
                    <p className="text-xs text-muted-foreground">
                      Ikon di tab browser. PNG/ICO, maks 2MB. Disarankan 32x32px.
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-secondary/50 shrink-0">
                        {faviconPreview ? (
                          <img
                            src={faviconPreview}
                            alt="Favicon"
                            className="h-10 w-10 object-contain"
                          />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <input
                          ref={faviconInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFaviconChange}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => faviconInputRef.current?.click()}
                          disabled={uploadingFavicon}
                        >
                          <Upload className="h-3.5 w-3.5 mr-1.5" />
                          {uploadingFavicon ? "Mengunggah..." : "Unggah Favicon"}
                        </Button>
                        {clubFavicon && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setClubFavicon("");
                              setFaviconPreview("");
                            }}
                          >
                            <X className="h-3.5 w-3.5 mr-1.5" />
                            Hapus Favicon
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nama Klub</Label>
                    <Input
                      value={clubName}
                      onChange={(e) => setClubName(e.target.value)}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>No. Telepon Klub</Label>
                    <Input
                      value={clubPhone}
                      onChange={(e) => setClubPhone(e.target.value)}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Alamat Klub</Label>
                    <Textarea
                      value={clubAddress}
                      onChange={(e) => setClubAddress(e.target.value)}
                      className="bg-secondary border-border"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Klub</Label>
                    <Input
                      value={clubEmail}
                      onChange={(e) => setClubEmail(e.target.value)}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Situs Web</Label>
                    <Input
                      value={clubWebsite}
                      onChange={(e) => setClubWebsite(e.target.value)}
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>

                {/* Sejarah, Visi, Misi */}
                <div className="pt-4 border-t border-border space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Profil Publik Klub</h3>
                  <p className="text-xs text-muted-foreground">
                    Informasi ini ditampilkan di halaman publik Profil Klub.
                  </p>
                  <div className="space-y-2">
                    <Label>Sejarah Klub</Label>
                    <Textarea
                      value={clubHistory}
                      onChange={(e) => setClubHistory(e.target.value)}
                      className="bg-secondary border-border"
                      rows={4}
                      placeholder="Tuliskan sejarah singkat klub..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Visi</Label>
                      <Textarea
                        value={clubVision}
                        onChange={(e) => setClubVision(e.target.value)}
                        className="bg-secondary border-border"
                        rows={3}
                        placeholder="Visi klub..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Misi</Label>
                      <Textarea
                        value={clubMission}
                        onChange={(e) => setClubMission(e.target.value)}
                        className="bg-secondary border-border"
                        rows={3}
                        placeholder="Misi klub..."
                      />
                    </div>
                  </div>
                </div>

                {/* Sponsors */}
                <div className="pt-4 border-t border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Sponsor & Mitra</h3>
                      <p className="text-xs text-muted-foreground">
                        Kelola logo sponsor yang ditampilkan di halaman publik.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSponsorName("");
                        setSponsorLogo("");
                        setSponsorLogoPreview("");
                        setSponsorWebsite("");
                        setShowSponsorDialog(true);
                      }}
                    >
                      <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                      Tambah Sponsor
                    </Button>
                  </div>

                  {sponsors.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {sponsors.map((sponsor, index) => (
                        <div
                          key={sponsor._id || index}
                          className="relative group rounded-xl border border-border bg-secondary/50 p-3 flex flex-col items-center gap-2"
                        >
                          <button
                            type="button"
                            onClick={() => handleRemoveSponsor(index)}
                            className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20"
                            title="Hapus sponsor"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <div className="h-16 w-16 rounded-lg bg-background border border-border flex items-center justify-center overflow-hidden">
                            {sponsor.logo ? (
                              <img src={sponsor.logo} alt={sponsor.name} className="h-full w-full object-contain p-1" />
                            ) : (
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <p className="text-xs font-medium text-foreground text-center truncate w-full">
                            {sponsor.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border py-8 flex flex-col items-center gap-2 text-muted-foreground">
                      <ImageIcon className="h-8 w-8" />
                      <p className="text-sm">Belum ada sponsor</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveClub}
                    disabled={saving}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Kelola akun pengguna dan hak akses sistem
            </p>
            {sessionUser?.role === "Admin" && (
              <Button
                onClick={openAddDialog}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Tambah User
              </Button>
            )}
          </div>

          <Card className="border-border bg-card overflow-hidden">
            <CardContent className="p-0">
              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Memuat...</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Pengguna
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Email
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Role
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Status
                        </th>
                        <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user: any) => (
                        <tr
                          key={user._id}
                          className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                        >
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {user.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                    .slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium text-foreground">
                                {user.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-sm text-muted-foreground">
                            {user.email}
                          </td>
                          <td className="px-6 py-3">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                                roleColors[user.role] ||
                                  "bg-gray-500/10 text-gray-400 border-gray-500/20"
                              )}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <StatusBadge status={user.status} />
                          </td>
                          <td className="px-6 py-3 text-right">
                            {sessionUser?.role === "Admin" && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="bg-card border-border"
                                >
                                  <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className={user.status === "Menunggu" ? "text-green-500" : "text-destructive"}
                                    onClick={() => setShowBanConfirm(user)}
                                  >
                                    {getStatusActionLabel(user.status)}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit Pengguna" : "Tambah User Baru"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="bg-secondary border-border"
                placeholder="Nama lengkap"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="bg-secondary border-border"
                placeholder="email@example.com"
                type="email"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={formRole} onValueChange={setFormRole}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Pelatih">Pelatih</SelectItem>
                  <SelectItem value="Atlet">Atlet</SelectItem>
                  <SelectItem value="Ketua Klub">Ketua Klub</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                {editingUser ? "Password Baru (kosongkan jika tidak diubah)" : "Password"}
              </Label>
              <Input
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                className="bg-secondary border-border"
                placeholder="Minimal 8 karakter"
                type="password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSaveUser}
              disabled={dialogSaving || !formName || !formEmail}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {dialogSaving ? "Menyimpan..." : editingUser ? "Update" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban/Activate/Approve User Confirm Dialog */}
      <Dialog open={!!showBanConfirm} onOpenChange={() => setShowBanConfirm(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>
              {showBanConfirm?.status === "Menunggu"
                ? "Setujui User"
                : showBanConfirm?.status === "Aktif"
                  ? "Nonaktifkan User"
                  : "Aktifkan User"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Apakah Anda yakin ingin{" "}
            {showBanConfirm?.status === "Menunggu"
              ? "menyetujui"
              : showBanConfirm?.status === "Aktif"
                ? "menonaktifkan"
                : "mengaktifkan"}{" "}
            user <span className="font-semibold text-foreground">{showBanConfirm?.name}</span>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanConfirm(null)}>
              Batal
            </Button>
            <Button
              variant={showBanConfirm?.status === "Aktif" ? "destructive" : "default"}
              onClick={() => handleBanUser(showBanConfirm)}
              disabled={dialogSaving}
            >
              {dialogSaving
                ? "Memproses..."
                : getStatusActionLabel(showBanConfirm?.status || "")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Sponsor Dialog */}
      <Dialog open={showSponsorDialog} onOpenChange={setShowSponsorDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Tambah Sponsor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Sponsor</Label>
              <Input
                value={sponsorName}
                onChange={(e) => setSponsorName(e.target.value)}
                className="bg-secondary border-border"
                placeholder="Nama sponsor atau mitra"
              />
            </div>
            <div className="space-y-2">
              <Label>Logo Sponsor</Label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-secondary/50 shrink-0">
                  {sponsorLogoPreview ? (
                    <img src={sponsorLogoPreview} alt="Preview" className="h-full w-full object-contain p-1" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={sponsorLogoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSponsorLogoChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => sponsorLogoInputRef.current?.click()}
                    disabled={uploadingSponsorLogo}
                  >
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    {uploadingSponsorLogo ? "Mengunggah..." : "Unggah Logo"}
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Website (opsional)</Label>
              <Input
                value={sponsorWebsite}
                onChange={(e) => setSponsorWebsite(e.target.value)}
                className="bg-secondary border-border"
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSponsorDialog(false)}>
              Batal
            </Button>
            <Button
              onClick={handleAddSponsor}
              disabled={!sponsorName.trim() || !sponsorLogo}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Tambah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
