import { Link } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
}

const ProductCard = ({ id, name, price, image, category }: ProductCardProps) => {
  return (
    <Link 
      to={`/product/${id}`}
      className="group block"
    >
      <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted mb-4">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-smooth group-hover:scale-105"
        />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-smooth">
          {name}
        </h3>
        {category && (
          <p className="text-xs text-muted-foreground">{category}</p>
        )}
        <p className="text-sm font-medium text-foreground">${price.toFixed(2)}</p>
      </div>
    </Link>
  );
};

export default ProductCard;
