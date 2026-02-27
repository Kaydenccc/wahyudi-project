"use client";

import { useState, useEffect } from "react";
import { User, Save, KeyRound, Dumbbell } from "lucide-react";
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
import { PageHeader } from "@/components/shared/page-header";
import { toast } from "sonner";
import { useSession } from "@/hooks/use-session";

export default function ProfilPage() {
  const { user: sessionUser, refresh: refreshSession } = useSession();
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Common fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");

  // Atlet & Pelatih
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");

  // Atlet only
  const [category, setCategory] = useState("");
  const [position, setPosition] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const role = sessionUser?.role;

  // Fetch full profile data
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/auth/profile");
        if (res.ok) {
          const data = await res.json();
          setName(data.name || "");
          setEmail(data.email || "");
          setPhone(data.phone || "");
          setAddress(data.address || "");
          setDateOfBirth(
            data.dateOfBirth
              ? new Date(data.dateOfBirth).toISOString().split("T")[0]
              : ""
          );
          setGender(data.gender || "");
          setCategory(data.category || "");
          setPosition(data.position || "");
          setHeight(data.height?.toString() || "");
          setWeight(data.weight?.toString() || "");
          setLoaded(true);
        }
      } catch {
        // ignore
      }
    }
    fetchProfile();
  }, []);

  // Sync name/email from session if profile hasn't loaded yet
  useEffect(() => {
    if (sessionUser && !loaded) {
      setName(sessionUser.name || "");
      setEmail(sessionUser.email || "");
    }
  }, [sessionUser, loaded]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Nama tidak boleh kosong");
      return;
    }
    if (!email.trim()) {
      toast.error("Email tidak boleh kosong");
      return;
    }
    if (password && password.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }

    if (password && !currentPassword) {
      toast.error("Password lama wajib diisi untuk mengubah password");
      return;
    }

    const body: Record<string, unknown> = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      ...(password ? { password, currentPassword } : {}),
    };

    if (role === "Atlet" || role === "Pelatih") {
      if (dateOfBirth) body.dateOfBirth = dateOfBirth;
      if (gender) body.gender = gender;
    }

    if (role === "Atlet") {
      if (category) body.category = category;
      if (position) body.position = position;
      if (height) body.height = Number(height);
      if (weight) body.weight = Number(weight);
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan profil");
      }
      toast.success("Profil berhasil disimpan!");
      refreshSession();
      setCurrentPassword("");
      setPassword("");
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan profil");
    } finally {
      setSaving(false);
    }
  };

  const initials = sessionUser?.name
    ? sessionUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "??";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil Saya"
        description="Kelola informasi pribadi dan keamanan akun Anda."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="border-border bg-card lg:col-span-1">
          <CardContent className="flex flex-col items-center py-8 space-y-4">
            <Avatar className="h-24 w-24 border-4 border-primary/30">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">
                {sessionUser?.name || "Memuat..."}
              </p>
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary border-primary/20 mt-1">
                {sessionUser?.role || ""}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {sessionUser?.email || ""}
            </p>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informasi Pribadi */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Pribadi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Lengkap</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>No. Telepon</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="bg-secondary border-border"
                  />
                </div>

                {(role === "Atlet" || role === "Pelatih") && (
                  <div className="space-y-2">
                    <Label>Tanggal Lahir</Label>
                    <Input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="bg-secondary border-border"
                    />
                  </div>
                )}

                {(role === "Atlet" || role === "Pelatih") && (
                  <div className="space-y-2">
                    <Label>Jenis Kelamin</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Pilih jenis kelamin" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                        <SelectItem value="Perempuan">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

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
                <Label>Alamat</Label>
                <Textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Masukkan alamat lengkap"
                  className="bg-secondary border-border"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Informasi Atletik - hanya Atlet */}
          {role === "Atlet" && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Dumbbell className="h-5 w-5" />
                  Informasi Atletik
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kategori</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="Pra Usia Dini">Pra Usia Dini</SelectItem>
                        <SelectItem value="Usia Dini">Usia Dini</SelectItem>
                        <SelectItem value="Anak-anak">Anak-anak</SelectItem>
                        <SelectItem value="Pemula">Pemula</SelectItem>
                        <SelectItem value="Remaja">Remaja</SelectItem>
                        <SelectItem value="Taruna">Taruna</SelectItem>
                        <SelectItem value="Dewasa">Dewasa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Posisi</Label>
                    <Select value={position} onValueChange={setPosition}>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Pilih posisi" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="Tunggal">Tunggal</SelectItem>
                        <SelectItem value="Ganda">Ganda</SelectItem>
                        <SelectItem value="Keduanya">Keduanya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tinggi Badan (cm)</Label>
                    <Input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="Contoh: 170"
                      className="bg-secondary border-border"
                      min={100}
                      max={250}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Berat Badan (kg)</Label>
                    <Input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="Contoh: 65"
                      className="bg-secondary border-border"
                      min={30}
                      max={200}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ubah Password */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <KeyRound className="h-5 w-5" />
                Ubah Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Password Lama</Label>
                <Input
                  type="password"
                  placeholder="Masukkan password lama"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Password Baru</Label>
                <Input
                  type="password"
                  placeholder="Kosongkan jika tidak ingin mengubah"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Minimal 8 karakter
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
