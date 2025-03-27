import supabase from "@shared/_config/DbConfig.ts";


export default async function uploadPrivateMeme(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    console.log(file);

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
    }

    const filePath = `uploads/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("meme")
      .upload(filePath, file, { upsert: false });

    if (uploadError) {
      return new Response(JSON.stringify({ error: uploadError.message }), { status: 500 });
    }

    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from("meme")
      .createSignedUrl(filePath, 60 * 60);

    if (urlError) {
      return new Response(JSON.stringify({ error: urlError.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ url: signedUrlData.signedUrl }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ error: err }), { status: 500 });
  }
}
