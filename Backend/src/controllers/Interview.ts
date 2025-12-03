export async function register(req:Request,res:Response) {
    const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email dan password wajib diisi" });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: "User berhasil didaftarkan", user: data.user });
}
