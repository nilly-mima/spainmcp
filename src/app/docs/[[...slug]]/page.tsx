import { source } from '@/lib/source';
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from 'fumadocs-ui/page';
import { notFound, redirect } from 'next/navigation';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Callout } from 'fumadocs-ui/components/callout';
import { CopyPageButton } from '@/components/docs/CopyPageButton';
import { ConceptCard } from '@/components/docs/ConceptCard';
import { QuickstartCard, QuickstartCards } from '@/components/docs/QuickstartCards';
import { PageFeedback } from '@/components/docs/PageFeedback';
import { SimpleDocsNav } from '@/components/docs/SimpleDocsNav';

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  if (!params.slug) redirect('/docs/primeros-pasos/introduccion');
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full} slots={{ footer: SimpleDocsNav }}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <DocsTitle>{page.data.title}</DocsTitle>
          <DocsDescription>{page.data.description}</DocsDescription>
        </div>
        <CopyPageButton />
      </div>
      <DocsBody>
        <MDX
          components={{
            ...defaultMdxComponents,
            Tab,
            Tabs,
            Callout,
            ConceptCard,
            QuickstartCard,
            QuickstartCards,
          }}
        />
        <PageFeedback />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
