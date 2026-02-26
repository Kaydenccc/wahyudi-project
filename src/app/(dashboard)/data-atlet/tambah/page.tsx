"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { ArrowLeft, Upload, Save, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function TambahAtletPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    address: "",
    category: "",
    position: "",
    height: "",
    weight: "",
    status: "",
    joinDate: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Format file tidak didukung. Gunakan JPG, PNG, atau WebP.");
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let photoUrl = "";

      // Upload photo first if exists
      if (photoFile) {
        const uploadData = new FormData();
        uploadData.append("file", photoFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.error || "Gagal mengunggah foto");
        }
        const uploadResult = await uploadRes.json();
        photoUrl = uploadResult.url;
      }

      const body = {
        name: formData.name,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phone: formData.phone,
        address: formData.address,
        category: formData.category,
        position: formData.position,
        height: Number(formData.height),
        weight: Number(formData.weight),
        status: formData.status || "Aktif",
        joinDate: formData.joinDate || new Date().toISOString().split("T")[0],
        ...(photoUrl ? { photo: photoUrl } : {}),
      };

      const res = await fetch("/api/athletes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal menambahkan atlet");
      }

      toast.success("Atlet berhasil ditambahkan!");
      router.push("/data-atlet");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menambahkan atlet");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/data-atlet" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Data Atlet
      </Link>

      <PageHeader
        title="Tambah Atlet Baru"
        description="Isi formulir di bawah untuk menambahkan atlet baru ke roster klub."
      />

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Personal Info */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Informasi Pribadi</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  placeholder="Masukkan nama lengkap"
                  className="bg-secondary border-border"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Tanggal Lahir</Label>
                <Input
                  id="dob"
                  type="date"
                  className="bg-secondary border-border"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Jenis Kelamin</Label>
                <Select value={formData.gender} onValueChange={(v) => handleChange("gender", v)}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">No. Telepon</Label>
                <Input
                  id="phone"
                  placeholder="08xxxxxxxxxx"
                  className="bg-secondary border-border"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Textarea
                  id="address"
                  placeholder="Masukkan alamat lengkap"
                  className="bg-secondary border-border"
                  rows={2}
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Athletic Info */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Informasi Atletik</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Select value={formData.category} onValueChange={(v) => handleChange("category", v)}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="Pemula">Pemula</SelectItem>
                    <SelectItem value="Junior">Junior</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Posisi</Label>
                <Select value={formData.position} onValueChange={(v) => handleChange("position", v)}>
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
                  placeholder="170"
                  className="bg-secondary border-border"
                  required
                  value={formData.height}
                  onChange={(e) => handleChange("height", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Berat Badan (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="65"
                  className="bg-secondary border-border"
                  required
                  value={formData.weight}
                  onChange={(e) => handleChange("weight", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="Aktif">Aktif</SelectItem>
                    <SelectItem value="Pemulihan">Pemulihan</SelectItem>
                    <SelectItem value="Non-Aktif">Non-Aktif</SelectItem>
                    <SelectItem value="Pro Roster">Pro Roster</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="joinDate">Tanggal Bergabung</Label>
                <Input
                  id="joinDate"
                  type="date"
                  className="bg-secondary border-border"
                  value={formData.joinDate}
                  onChange={(e) => handleChange("joinDate", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Photo Upload */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Foto Atlet</CardTitle>
            </CardHeader>
            <CardContent>
              {photoPreview ? (
                <div className="flex items-center gap-4">
                  <div className="relative h-40 w-40 rounded-xl overflow-hidden border border-border">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-foreground font-medium">{photoFile?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {photoFile ? (photoFile.size / 1024 / 1024).toFixed(2) : 0} MB
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removePhoto}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-primary">Klik untuk unggah</span> atau seret dan lepas
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG maksimal 5MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center gap-3 justify-end">
            <Link href="/data-atlet">
              <Button variant="outline" type="button">Batal</Button>
            </Link>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Menyimpan..." : "Simpan Atlet"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
