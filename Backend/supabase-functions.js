require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

// After an immense amount of troubleshooting, not understanding why bytea stored in supabase kept corrupting
// the buffer... The solution was hexToBuffer, since supabase returned a string that started with \\x
// Instead of a JSON buffer like stored locally in postgresql

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

// Convert supabase return value to buffer
function hexToBuffer(hexString) {
  // Check for and remove the "\x" prefix
  if (hexString.startsWith("\\x")) {
    hexString = hexString.slice(2);
  }
  return Buffer.from(hexString, "hex");
}

async function migrateImages() {
  const { data: linksData, error: linksError } = await supabase
    .from("Link")
    .select("id, userId, thumbnail");
  if (linksError) {
    console.error("Failed, Error: ", linksError);
    return;
  }

  for (const link of linksData) {
    let imagePath = `thumbnails/${link.userId}/${link.id}`;
    let publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/thumbnails/${imagePath}`;

    // let buffer = link.thumbnail;
    // buffer = hexToBuffer(buffer);

    // fs.writeFileSync("output.jpg", buffer, (err) => {
    //   if (err) throw err;
    //   console.log("The file has been saved!");
    // });

    // const { data: uploadData, error: uploadError } = await supabase.storage
    //   .from("thumbnails")
    //   .upload(imagePath, buffer, {
    //     contentType: "image/jpeg",
    //     upsert: true,
    //   });

    // if (uploadError) {
    //   console.error("Failed to upload image:", uploadError);
    //   continue;
    // }

    const { error: updateError } = await supabase
      .from("Link")
      .update({ pURL: publicUrl })
      .match({ id: link.id });

    if (updateError) {
      console.log(imagePath, link.id);
      console.error("Failed to update image URL:", updateError);
    }
  }
}

async function renamePaths() {
  const { data, error } = await supabase.storage
    .from("thumbnails")
    .list("thumbnails", { limit: 100, offset: 0 });
  if (error) {
    console.error(error);
  } else {
    for (const directory of data) {
      let path = `thumbnails/${directory.name}`;
      const { data: files, error: fileError } = await supabase.storage
        .from("thumbnails")
        .list(path, {
          limit: 100,
        });

      for (const file of files) {
        let newName = file.name;
        if (file.name.endsWith(".webp") || file.name.endsWith("jpeg")) {
          newName = file.name.slice(0, -5);
        } else if (file.name.endsWith("jpg") || file.name.endsWith("png")) {
          newName = file.name.slice(0, -4);
        }

        const { data: fileMove, error: fileMoveError } = await supabase.storage
          .from("thumbnails")
          .move(
            `thumbnails/${directory.name}/${file.name}`,
            `thumbnails/${directory.name}/${newName}`,
          );

        fileMoveError ? console.error(fileMoveError) : console.log("success");
      }
    }

    // const images = data.forEach(async (dat) => {
    //   const { data: names } = await supabase.storage
    //     .from("thumbnails")
    //     .list(dat.name, {
    //       limit: 100,
    //       offset: 0,
    //       search: ".webp",
    //     });

    //   console.log(dat.name);
    //   console.log(names);
    //   return names;
    // });
  }
}

// migrateImages();
renamePaths();
