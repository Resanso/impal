import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { createClient } from "~/lib/supabase/server";

interface FnbItem {
  id: number;
  nama: string;
  harga: number;
  stok: number;
  kategori: 'Makanan' | 'Minuman';
}

export const fnbRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("menu_fnb")
      .select("*")
      .order("kategori");

    if (error) throw new Error(error.message);
    return (data as FnbItem[]) ?? [];
  }),

  getByKategori: publicProcedure
    .input(z.enum(["Makanan", "Minuman"]))
    .query(async ({ input }) => {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("menu_fnb")
        .select("*")
        .eq("kategori", input)
        .order("nama");

      if (error) throw new Error(error.message);
      return (data as FnbItem[]) ?? [];
    }),

  create: publicProcedure
    .input(
      z.object({
        nama: z.string().min(1),
        harga: z.number().positive(),
        stok: z.number().nonnegative(),
        kategori: z.enum(["Makanan", "Minuman"]),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = await createClient();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { data, error } = await supabase
        .from("menu_fnb")
        .insert([input])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return (data as FnbItem) ?? null;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        nama: z.string().min(1).optional(),
        harga: z.number().positive().optional(),
        stok: z.number().nonnegative().optional(),
        kategori: z.enum(["Makanan", "Minuman"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = await createClient();
      const { id, ...updates } = input;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { data, error } = await supabase
        .from("menu_fnb")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return (data as FnbItem) ?? null;
    }),

  delete: publicProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      const supabase = await createClient();
      const { error } = await supabase.from("menu_fnb").delete().eq("id", input);

      if (error) throw new Error(error.message);
      return { success: true };
    }),
});
