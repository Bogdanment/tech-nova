type ProductImageProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  loading?: 'eager' | 'lazy';
  decorative?: boolean;
};

const isFallbackImage = (src: string) => src.includes('picsum.photos');

const ProductImage = ({
  src,
  alt,
  className = '',
  imageClassName = '',
  loading = 'lazy',
  decorative = false,
}: ProductImageProps) => {
  const fitClass = isFallbackImage(src) ? 'object-cover p-0' : 'object-contain p-3';

  return (
    <div className={`overflow-hidden bg-slate-100 ${className}`}>
      <img
        src={src}
        alt={alt}
        loading={loading}
        aria-hidden={decorative || undefined}
        className={`h-full w-full ${fitClass} ${imageClassName}`}
      />
    </div>
  );
};

export default ProductImage;
