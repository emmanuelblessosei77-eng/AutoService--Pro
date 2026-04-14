import { Award, Zap, TrendingUp, Users } from 'lucide-react';

export function Values() {
  const values = [
    { icon: Award, title: 'Excellence', description: 'We strive for the highest quality in everything we do' },
    { icon: Users, title: 'Community', description: 'We build lasting relationships with our customers' },
    { icon: Zap, title: 'Innovation', description: 'We embrace new technologies and methods' },
    { icon: TrendingUp, title: 'Integrity', description: 'We operate with honesty and transparency' }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
          <p className="text-gray-600">What drives everything we do</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {values.map((value, idx) => {
            const Icon = value.icon;
            return (
              <div key={idx} className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}




