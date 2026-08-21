import PropertyCard from './PropertyCard';

export default function PropertyGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {[1,2,3].map((item) => (
        <PropertyCard
          key={item}
          title={`Property ${item}`}
          price={`$${1200 + item * 150}/mo`}
          description="Modern apartment with city views and secure parking."
        />
      ))}
    </div>
  );
}
