export const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Terjadi kesalahan saat mengambil data");
  return res.json();
});
