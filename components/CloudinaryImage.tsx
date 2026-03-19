import Image, { type ImageProps } from "next/image";

import { getCloudinaryImage } from "@/lib/cloudinary-url";

type CloudinaryImageProps = Omit<ImageProps, "src"> & {
  src: string;
};

export function CloudinaryImage({ src, width, height, alt, ...props }: CloudinaryImageProps) {
  return (
    <Image
      src={getCloudinaryImage(src, Number(width), Number(height))}
      width={width}
      height={height}
      alt={alt}
      {...props}
    />
  );
}

export default CloudinaryImage;
