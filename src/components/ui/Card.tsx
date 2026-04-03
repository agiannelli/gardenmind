interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function Card({ children, onClick, className }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-sage-200 rounded-lg p-4 hover:shadow-md transition-shadow ${
        onClick ? "cursor-pointer" : ""
      } ${className || ""}`}
    >
      {children}
    </div>
  );
}
