type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="max-w-3xl">
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 text-base text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}
