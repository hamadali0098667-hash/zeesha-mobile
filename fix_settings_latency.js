const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Settings.jsx', 'utf-8');

const replacement = `  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    });
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setUploadingLogo(true);
    let logoUrl = settings.shopLogo;

    try {
      if (logoFile) {
        // Compress image locally instead of uploading a huge file
        logoUrl = await compressImage(logoFile);
      }

      const { data } = await axios.put('https://zeesha-mobile.vercel.app/api/settings', { 
        shopName: settings.shopName, 
        shopLogo: logoUrl, 
        currency: settings.currency, 
        sidebarPreference: settings.sidebarPreference,
        invoiceFooter: settings.invoiceFooter, 
        categories: settings.categories 
      }, {
        headers: { Authorization: \`Bearer \${user.token}\` }
      });
      setSettings(data);
      setLogoFile(null);
      alert('Settings saved successfully! Refresh to apply globally.');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error saving settings');
    } finally {
      setUploadingLogo(false);
    }
  };`;

// Use regex to replace the entire handleSaveSettings block
content = content.replace(/const handleSaveSettings = async \(e\) => \{[\s\S]*?finally \{\s*setUploadingLogo\(false\);\s*\}\s*\};/, replacement);

fs.writeFileSync('client/src/pages/Settings.jsx', content);
