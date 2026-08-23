const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'client', 'src', 'pages', 'Inventory.jsx');
let content = fs.readFileSync(srcPath, 'utf8');

// 1. Add image to newProduct state
content = content.replace("stockQty: 0, lowStockThreshold: 5 }", "stockQty: 0, lowStockThreshold: 5, image: '' }");
content = content.replace("stockQty: 0, lowStockThreshold: 5 }", "stockQty: 0, lowStockThreshold: 5, image: '' }"); // For reset

// 2. Add state for file and uploading
content = content.replace(
  "const [newProduct, setNewProduct]",
  "const [imageFile, setImageFile] = useState(null);\n  const [uploadingImage, setUploadingImage] = useState(false);\n  const [newProduct, setNewProduct]"
);

// 3. Update addProduct logic to upload image first
content = content.replace(
  "const addProduct = async (e) => {",
  `const addProduct = async (e) => {
    e.preventDefault();
    setUploadingImage(true);
    let imageUrl = newProduct.image;
    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const res = await axios.post('http://localhost:5000/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data', Authorization: \`Bearer \${user.token}\` }});
        imageUrl = res.data;
      }
      const productToSave = { ...newProduct, image: imageUrl };
      await axios.post('http://localhost:5000/api/products', productToSave, { headers: { Authorization: \`Bearer \${user.token}\` }});
      setShowAddForm(false); 
      setNewProduct({ name: '', brand: '', model: '', imeiSku: '', category: '', costPrice: 0, salePrice: 0, stockQty: 0, lowStockThreshold: 5, image: '' });
      setImageFile(null);
      fetchProducts();
    } catch (err) { alert('Error adding product'); }
    finally { setUploadingImage(false); }
  };
  
  // Ignore original logic:
  const ignoreOld = () => {`
);

content = content.replace(
  "fetchProducts();\n    } catch(err)",
  "// fetchProducts();\n    } catch(err)"
);

// Actually, replacing string directly like this is risky. Let's do a better replace using string split.
