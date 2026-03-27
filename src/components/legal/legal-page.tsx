type LegalSection = {
  heading: string;
  paragraphs: readonly string[];
};

type LegalPageProps = {
  title: string;
  description: string;
  lastUpdated: string;
  sections: readonly LegalSection[];
};

export function LegalPage({
  title,
  description,
  lastUpdated,
  sections,
}: LegalPageProps) {
  return (
    <main className="bg-background text-foreground min-h-svh px-6 py-12 md:px-10 md:py-16">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
        <div className="border-border flex flex-wrap items-center justify-between gap-4 border-b pb-6">
          <div className="space-y-3">
            <p className="text-muted-foreground font-mono text-xs tracking-[0.24em] uppercase">
              Legal
            </p>
            <div className="space-y-2">
              <h1 className="font-serif text-4xl font-semibold tracking-tight md:text-5xl">
                {title}
              </h1>
              <p className="text-muted-foreground max-w-2xl text-sm leading-7 md:text-base">
                {description}
              </p>
            </div>
          </div>
        </div>
        <div className="border-border bg-card/70 text-muted-foreground rounded-sm border p-4 text-sm">
          Last updated: {lastUpdated}
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.heading} className="space-y-3">
              <h2 className="font-serif text-2xl font-semibold tracking-tight">
                {section.heading}
              </h2>
              <div className="text-foreground/90 space-y-3 text-sm leading-7 md:text-base">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
