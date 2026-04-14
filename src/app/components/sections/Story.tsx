interface StoryProps {
  title: string;
  paragraphs: string[];
  statNumber?: string;
  statLabel?: string;
}

export function Story({ title, paragraphs, statNumber, statLabel }: StoryProps) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold mb-6">{title}</h2>
            <div className="space-y-4">
              {paragraphs.map((paragraph, idx) => (
                <p key={idx} className="text-gray-600 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
          
          {statNumber && statLabel && (
            <div className="flex items-center justify-center bg-blue-50 rounded-lg p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {statNumber}
                </div>
                <div className="text-gray-600 font-medium">
                  {statLabel}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}




