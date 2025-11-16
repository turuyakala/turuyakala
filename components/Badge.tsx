type BadgeProps = {
  variant: 'urgent' | 'last-seats' | 'discount' | 'default';
  children: React.ReactNode;
};

export default function Badge({ variant, children }: BadgeProps) {
  const variants = {
    urgent: 'bg-[#E63946] text-white',
    'last-seats': 'bg-[#E63946] text-white',
    discount: 'bg-[#1A2A5A] text-white',
    default: 'bg-[#DAE4F2] text-[#1A2A5A]',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

