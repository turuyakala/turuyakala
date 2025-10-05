type BadgeProps = {
  variant: 'urgent' | 'last-seats' | 'discount' | 'default';
  children: React.ReactNode;
};

export default function Badge({ variant, children }: BadgeProps) {
  const variants = {
    urgent: 'bg-red-600 text-white',
    'last-seats': 'bg-orange-600 text-white',
    discount: 'bg-green-600 text-white',
    default: 'bg-gray-600 text-white',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

