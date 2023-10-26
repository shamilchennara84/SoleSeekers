
function initializeImageCropping(imagePath, imageId) {
  const image = document.querySelector(`#${imageId}`);
  const cropper = new Cropper(image, {
    aspectRatio: 16 / 9, // Set your desired aspect ratio
    crop(event) {
      const data = cropper.getData();
      const x = data.x;
      const y = data.y;
      const width = data.width;
      const height = data.height;
      currentCroppingData = data;
      console.log(x, '-', y, '-', width, '-', height);
      cropImage(imagePath, x, y, width, height);
    },
  });
}

document.querySelectorAll('.crop-button').forEach((button) => {
  button.addEventListener('click', () => {
    const imagePath = button.getAttribute('data-image-path');
    const imageId = button.previousElementSibling.id;
    console.log(imagePath);
    console.log(imageId);
    initializeImageCropping(imagePath, imageId);
  });
});

document.querySelector('#crop-done-button').addEventListener('click', () => {
  if (currentImageId) {
    const imagePath = document.querySelector(`#${currentImageId}`).getAttribute('src');
    if (currentCroppingData) {
      const x = currentCroppingData.x;
      const y = currentCroppingData.y;
      const width = currentCroppingData.width;
      const height = currentCroppingData.height;
      cropImage(imagePath, x, y, width, height);
    }
  }
});
