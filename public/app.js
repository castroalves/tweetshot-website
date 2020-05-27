let filePath;

const preview = document.getElementById('preview');
const goBtn = document.getElementById('go');

goBtn.addEventListener('click', async (event) => {

  event.preventDefault();

  preview.innerHTML = '';

  const originalLabel = goBtn.innerText;

  // Disable Create Button while screenshot is pending
  goBtn.disabled = true;
  goBtn.querySelector('span').innerText = 'Generating...';

  const formData = {
    tweetUrl: document.getElementById('url').value,
    theme: document.getElementById('theme').value,
    lang: document.getElementById('lang').value
  };

  const screenshot = await fetch(
    'screenshot',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    }
  );

  const result = await screenshot.json();

  // console.log(result);

  if (result.error) {
    console.error(`Error: ${result.message}`);
  } else {
    filePath = `${window.location.origin}/shots/${result.filename}`;
    preview.innerHTML = `<a href="${filePath}" title="Click to download" download><img src="${filePath}" /></a>`;
  }

  // Enable Create Button
  goBtn.querySelector('span').innerText = originalLabel;
  goBtn.disabled = false;

  return false;

});
