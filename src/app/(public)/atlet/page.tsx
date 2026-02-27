"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Users, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { usePublicAthletes } from "@/hooks/use-public-data";
import { useDebouncedValue } from "@/hooks/use-debounce";

const categories = [
  { label: "Semua Kategori", value: "all" },
  { label: "Pra Usia Dini", value: "Pra Usia Dini" },
  { label: "Usia Dini", value: "Usia Dini" },
  { label: "Anak-anak", value: "Anak-anak" },
  { label: "Pemula", value: "Pemula" },
  { label: "Remaja", value: "Remaja" },
  { label: "Taruna", value: "Taruna" },
  { label: "Dewasa", value: "Dewasa" },
];

interface Athlete {
  _id: string;
  customId: string;
  name: string;
  category: string;
  position: string;
  gender: string;
  photo: string;
  age: number;
  achievementCount: number;
}

export default function PublicAtletPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebouncedValue(searchQuery, 500);

  const { athletes, pagination, isLoading } = usePublicAthletes({
    search: debouncedSearch,
    category: selectedCategory === "all" ? "" : selectedCategory,
    page: currentPage,
    limit: 12,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderPaginationNumbers = () => {
    const { totalPages, page } = pagination;
    if (totalPages <= 1) return null;

    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (page > 3) {
        pages.push("...");
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages.map((p, idx) => {
      if (p === "...") {
        return (
          <span
            key={`ellipsis-${idx}`}
            className="px-2 text-muted-foreground select-none"
          >
            ...
          </span>
        );
      }

      const pageNum = p as number;
      return (
        <Button
          key={pageNum}
          variant={pageNum === currentPage ? "default" : "outline"}
          size="icon"
          className={`h-9 w-9 ${
            pageNum === currentPage
              ? "bg-primary text-primary-foreground"
              : "border-border hover:bg-secondary"
          }`}
          onClick={() => setCurrentPage(pageNum)}
        >
          {pageNum}
        </Button>
      );
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Daftar Atlet
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Jelajahi profil atlet kami dan lihat perjalanan prestasi mereka di
            berbagai kategori usia.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atlet..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 bg-card border-border focus:border-primary"
            />
          </div>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-[200px] bg-card border-border">
              <SelectValue placeholder="Pilih Kategori" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-3">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Memuat...</p>
            </div>
          </div>
        )}

        {/* Athletes Grid */}
        {!isLoading && athletes.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {athletes.map((athlete: Athlete) => (
                <Link key={athlete._id} href={`/atlet/${athlete._id}`}>
                  <Card className="border-border bg-card hover:shadow-lg hover:shadow-primary/5 hover:scale-[1.02] transition-all duration-300 cursor-pointer group overflow-hidden h-full">
                    <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                      {/* Avatar / Photo */}
                      <div className="relative">
                        {athlete.photo ? (
                          <div className="h-20 w-20 rounded-full overflow-hidden border-3 border-primary/20 group-hover:border-primary/40 transition-colors">
                            <Image
                              src={athlete.photo}
                              alt={athlete.name}
                              width={80}
                              height={80}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <Avatar className="h-20 w-20 border-3 border-primary/20 group-hover:border-primary/40 transition-colors">
                            <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                              {getInitials(athlete.name)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>

                      {/* Name */}
                      <div className="space-y-1.5">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {athlete.name}
                        </h3>
                        <StatusBadge status={athlete.category} />
                      </div>

                      {/* Info */}
                      <div className="w-full space-y-2 text-sm">
                        {athlete.position && (
                          <p className="text-muted-foreground">
                            {athlete.position}
                          </p>
                        )}
                        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                          {athlete.age > 0 && (
                            <span>{athlete.age} tahun</span>
                          )}
                          {athlete.achievementCount > 0 && (
                            <span className="flex items-center gap-1 text-yellow-400">
                              <Trophy className="h-3.5 w-3.5" />
                              {athlete.achievementCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Results Info */}
            <div className="text-center text-sm text-muted-foreground">
              Menampilkan{" "}
              <span className="font-semibold text-foreground">
                {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-foreground">
                {pagination.total}
              </span>{" "}
              atlet
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 border-border hover:bg-secondary"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {renderPaginationNumbers()}

                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 border-border hover:bg-secondary"
                  disabled={currentPage >= pagination.totalPages}
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(pagination.totalPages, p + 1)
                    )
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && athletes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Tidak ada atlet ditemukan
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Coba ubah kata kunci pencarian atau pilih kategori yang berbeda.
              </p>
            </div>
            {(searchQuery || selectedCategory !== "all") && (
              <Button
                variant="outline"
                className="border-border"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setCurrentPage(1);
                }}
              >
                Reset Filter
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
