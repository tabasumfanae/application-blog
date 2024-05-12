import express from "express";
import bodyParser from "body-parser";
import path from "path";
import multer from "multer";
import methodOverride from "method-override";

const app = express();
const port = 3006;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

const storage = multer.diskStorage({
  destination: "./public/images",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
app.use(methodOverride("_method"));

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1 MB limit
});

const blogPosts = [
  {
    id: 1,
    title: "Kabul",
    content:
      "Kabul, the capital city of Afghanistan, is a place rich in history, culture, and cuisine. The city boasts a multitude of historical landmarks that speak to its diverse past, from the magnificent Babur's Gardens to the breathtaking Kabul Museum. The city's population is a vibrant mix of different ethnicities and backgrounds, creating a tapestry of traditions and customs. One cannot help but be enamored by the aromatic array of Afghan cuisine found in Kabul, with offerings such as delicious kebabs, hearty pilaf dishes, and sweet pastries like sheer yakh. The city's culture is a blend of ancient traditions with modern influences, evident in its art, music, and festivals. Overall, Kabul is a city that encapsulates the beauty and resilience of Afghanistan.",
    image: "images/Kabul.jpg",
  },
  {
    id: 2,
    title: "Herat",
    content:
      "Herat, a captivating city in Afghanistan, is a treasure trove of historical sites, cultural richness, and delectable traditional foods. The city is adorned with an array of historical landmarks like the Herat Citadel, the Grand Mosque of Herat, and the exquisite Friday Mosque with its stunning tile work and intricate architecture. The population of Herat is a diverse mix of ethnicities, contributing to a vibrant tapestry of cultural traditions that are proudly preserved through art, music, and festivals. Traditional Afghan foods such as mouth-watering mantu dumplings, flavorful Kabuli pulao, and sweet jalabi are savored throughout the city, adding to its culinary charm. With its rich history, warm hospitality, and culinary delights, Herat stands out as a beautiful gem in the heart of Afghanistan. ",
    image: "images/Herat.jpg",
  },
  {
    id: 3,
    title: "Mazar-Sharif",
    content:
      "Mazar-I-Sharif, a stunning city in Afghanistan, is renowned for its historical sites that reflect its rich cultural heritage. The Blue Mosque, a masterpiece of Islamic architecture, is a must-visit attraction with its dazzling blue tiles and intricate designs. The city is also home to the Shrine of Hazrat Ali, a revered site for Muslims worldwide. Traditional foods in Mazar-I-Sharif are a treat for the senses, with dishes like mantu (dumplings filled with meat and spices), qabuli pulao (rice cooked with raisins, carrots, and lamb), and shola (a hearty stew) being local specialties. The city's population is diverse, with a mix of Pashtuns, Tajiks, Uzbeks, and Hazaras living together harmoniously. Mazar-I-Sharif's culture is vibrant and colorful, with traditional music, dance, and crafts playing a significant role in daily life. The annual Balkh Cultural Festival celebrates the city's cultural heritage and showcases the talents of local artists and performers. Mazar-I-Sharif is a gem of a city that embodies the beauty and diversity of Afghanistan.",
    image: "images/Mazar-Sharif.jpg",
  },
  {
    id: 4,
    title: "Bamiyan",
    content:
      "Bamiyan is a breathtaking city located in central Afghanistan, known for its stunning historical sites and rich cultural heritage. The city is most famous for the ancient Buddha statues that were carved into the cliffs, which unfortunately were destroyed by the Taliban in 2001. However, Bamiyan still boasts other historical sites such as the Shar-i-Zohak fortress and the Shahr-e Gholghola ruins. The city's traditional cuisine includes dishes like mantu (dumplings filled with minced meat and onions) and qabuli pulao (rice cooked with raisins, carrots, and lamb). Bamiyan has a diverse population that includes Hazaras, Tajiks, and Pashtuns, contributing to a unique blend of cultures and traditions. The city's vibrant arts and crafts scene, along with its annual Silk Road Festival, showcase the rich cultural tapestry of Bamiyan.",
    image: "images/Bamiyan.jpg",
  },
  {
    id: 5,
    title: "Ghazni",
    content:
      "Ghazni, a beautiful city in Afghanistan, is steeped in history and boasts a wealth of historical sites that showcase its rich past. The city is home to the iconic Ghazni Minarets, a UNESCO World Heritage Site, as well as the imposing Ghazni Citadel, which dates back to the 13th century. Ghazni's traditional foods are a delight for the taste buds, with dishes like Kabuli pulao (rice cooked with lamb and spices), mantu (dumplings filled with minced meat), and aushak (leek-filled dumplings) being local favorites. The city's population is diverse, with Pashtuns, Tajiks, and Hazaras coexisting harmoniously and contributing to the vibrant cultural tapestry of Ghazni. The city's culture is characterized by its traditional music, dance, and crafts, with the annual Ghazni Cultural Festival showcasing the best of local talent and creativity. Ghazni is a city that truly encapsulates the beauty and diversity of Afghanistan.",
    image: "images/Ghazni.jpg",
  },
];

let posts = [...blogPosts];

app.get("/", (req, res) => {
  res.render("index", { posts });
});
app.get("/posts", (req, res) => {
  res.render("new-post");
});

app.post("/posts", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error(err);
    } else {
      const { title, content } = req.body;
      const image = req.file ? `/images/${req.file.filename}` : null;
      const id = posts.length + 1;

      const newPost = { id, title, content, image };
      posts.push(newPost);

      res.redirect("/");
    }
  });
});

app.get("/edit-post/:id", (req, res, next) => {
  const itemId = req.params.id;
  const selectedItem = posts.find((item) => item.id == itemId);
  if (!selectedItem) {
    // Handle the case where no item is found with the given id
    return res.status(404).send("Item not found");
  }
  res.render("./edit-post.ejs", { data: selectedItem });
  //console.log("selecten item in edit " + selectedItem.images);
});

app.put("/edit-post/:id", upload.single("image"), (req, res) => {
  let title = req.body.title;
  let body = req.body.body;
  let id = req.params.id;
  const selectedItem = posts.find((item) => item.id == id);

  const imagePath = req.file.path;

  // Remove the extra 'public/' directory from imagePath

  // Store the original item by creating a deep copy of the selectedItem
  const originalItem = JSON.parse(JSON.stringify(selectedItem));

  selectedItem.name = title;
  selectedItem.description = body;

  if (req.file) {
    // If a new image is uploaded, update the image path
    selectedItem.image = imagePath.replace("public/", "").replace(/\\/g, "/");
  }

  if (
    selectedItem.name !== originalItem.name ||
    selectedItem.description !== originalItem.description ||
    (req.file && selectedItem.image !== originalItem.images)
  ) {
    res.redirect("/?Emessage=true&&text=Post Updated Successfully");
  } else {
    res.redirect(`/`);
  }
});
app.post("/delete/:id", (req, res) => {
  const postId = parseInt(req.params.id);
  posts = posts.filter((post) => post.id !== postId);

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Blog application listening at http://localhost:${port}`);
});
