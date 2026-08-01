import Image from "next/image";

const fallbackImage =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267";

export function PropertyGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const galleryImages = images.length > 0 ? images : [fallbackImage];
  const [primaryImage, ...secondaryImages] = galleryImages;
  const previewImages =
    secondaryImages.length > 0 ? secondaryImages.slice(0, 4) : galleryImages.slice(0, 1);

  return (
    <div className="grid gap-3 lg:grid-cols-[1.4fr_0.6fr]">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-200">
        <Image
          alt={title}
          className="object-cover"
          fill
          priority
          sizes="(min-width: 1024px) 70vw, 100vw"
          src={primaryImage}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
        {previewImages.map((image, index) => (
          <div
            className="relative aspect-[16/10] overflow-hidden bg-slate-200 lg:aspect-auto"
            key={`${image}-${index}`}
          >
            <Image
              alt={`${title} preview ${index + 1}`}
              className="object-cover"
              fill
              sizes="(min-width: 1024px) 30vw, 50vw"
              src={image}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
