import { useTranslations } from 'next-intl'

export default function Home() {
  const t = useTranslations('home')

  return (
    <section className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <h1 className="text-3xl sm:text-4xl font-semibold">{t('title')}</h1>
      <p className="mt-3 text-sm text-muted-foreground max-w-xl">
        {t('description')}
      </p>
    </section>
  )
}
