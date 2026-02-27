"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { UserPlus, Eye, EyeOff, User, Dumbbell, Shield } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Role = "Atlet" | "Pelatih" | "Ketua Klub";

const roles: { value: Role; label: string; icon: typeof User; desc: string }[] = [
  { value: "Atlet", label: "Atlet", icon: Dumbbell, desc: "Pemain bulutangkis" },
  { value: "Pelatih", label: "Pelatih", icon: User, desc: "Pelatih / Coach" },
  { value: "Ketua Klub", label: "Ketua Klub", icon: Shield, desc: "Ketua / Pengurus" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<Role>("Atlet");

  // Common fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Shared by Atlet & Pelatih
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");

  // Atlet only
  const [category, setCategory] = useState("");
  const [position, setPosition] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }

    const body: Record<string, unknown> = {
      role,
      name,
      email,
      password,
      phone,
      address,
    };

    if (role === "Atlet" || role === "Pelatih") {
      if (!dateOfBirth) { toast.error("Tanggal lahir wajib diisi"); return; }
      if (!gender) { toast.error("Jenis kelamin wajib diisi"); return; }
      body.dateOfBirth = dateOfBirth;
      body.gender = gender;
    }

    if (role === "Atlet") {
      if (!category) { toast.error("Kategori wajib diisi"); return; }
      if (!position) { toast.error("Posisi wajib diisi"); return; }
      if (!height) { toast.error("Tinggi badan wajib diisi"); return; }
      if (!weight) { toast.error("Berat badan wajib diisi"); return; }
      body.category = category;
      body.position = position;
      body.height = Number(height);
      body.weight = Number(weight);
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Registrasi gagal");
        return;
      }
      toast.success("Registrasi berhasil! Akun Anda menunggu persetujuan admin sebelum dapat login.");
      router.push("/login");
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Role Selector */}
      <Card className="border-border bg-card">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl">Buat Akun Baru</CardTitle>
          <p className="text-sm text-muted-foreground">
            Pilih peran Anda dan lengkapi data untuk mendaftar
          </p>
        </CardHeader>
        <CardContent>
          <Label className="text-sm font-medium mb-3 block">Daftar Sebagai</Label>
          <div className="grid grid-cols-3 gap-3">
            {roles.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all",
                    role === r.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50"
                  )}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm font-semibold">{r.label}</span>
                  <span className="text-[11px] text-muted-foreground">{r.desc}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Informasi Akun */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Informasi Akun</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                placeholder="Masukkan nama lengkap"
                className="bg-secondary border-border"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                className="bg-secondary border-border"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 8 karakter"
                className="bg-secondary border-border pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informasi Pribadi */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Informasi Pribadi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">No. Telepon</Label>
              <Input
                id="phone"
                placeholder="08xxxxxxxxxx"
                className="bg-secondary border-border"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            {(role === "Atlet" || role === "Pelatih") && (
              <div className="space-y-2">
                <Label htmlFor="dob">Tanggal Lahir</Label>
                <Input
                  id="dob"
                  type="date"
                  className="bg-secondary border-border"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                />
              </div>
            )}

            {(role === "Atlet" || role === "Pelatih") && (
              <div className="space-y-2">
                <Label>Jenis Kelamin</Label>
                <Select value={gender} onValueChange={setGender} required>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Alamat</Label>
            <Textarea
              id="address"
              placeholder="Masukkan alamat lengkap"
              className="bg-secondary border-border"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Informasi Atletik - hanya untuk Atlet */}
      {role === "Atlet" && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Informasi Atletik</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={category} onValueChange={setCategory} required>
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
                <Select value={position} onValueChange={setPosition} required>
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
                <Label htmlFor="height">Tinggi Badan (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="Contoh: 170"
                  className="bg-secondary border-border"
                  min={100}
                  max={250}
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Berat Badan (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="Contoh: 65"
                  className="bg-secondary border-border"
                  min={30}
                  max={200}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit */}
      <div className="space-y-4">
        <Button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Memproses...
            </span>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Daftar sebagai {role}
            </>
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Masuk di sini
          </Link>
        </p>
      </div>
    </form>
  );
}
