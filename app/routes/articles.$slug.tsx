import type { Article, Query } from '@workaholic/core';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import type {
  MetaFunction,
  HeadersFunction,
  LinksFunction,
  LoaderFunction,
} from 'remix';
import { useLoaderData, json } from 'remix';
import SyntaxHighlighter from '~/components/SyntaxHighlighter';
import Hyperlink from '~/components/Hyperlink';
import { deriveMetaFromMetadata, enhanceMeta } from '~/utils/meta';
import stylesUrl from '~/styles/code.css';
import type { Context, WithContext } from '~/types';

export let links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: stylesUrl }];
};

export let headers: HeadersFunction = ({ loaderHeaders }) => {
  return {
    'Cache-Control': loaderHeaders.get('Cache-Control'),
  };
};

export let meta: MetaFunction = ({ data, location }) => {
  const meta = deriveMetaFromMetadata(data?.metadata);

  return enhanceMeta(meta, {
    pathname: location.pathname,
    type: 'article',
  });
};

export let loader: WithContext<LoaderFunction, Context, 'slug'> = async ({
  params,
  context,
}) => {
  const article = await context.query('data', `articles/${params.slug}`);

  return json(article, {
    status: article.content !== null ? 200 : 404,
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

export default function ArticleSlug() {
  const { content } = useLoaderData<Article>();

  return (
    <ReactMarkdown
      className="prose prose-sm"
      components={{
        a({ node, href, ...props }) {
          return <Hyperlink to={href} {...props} />;
        },
        pre({ node, ...props }) {
          return <figure {...props} />;
        },
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');

          if (inline || !match) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }

          return (
            <SyntaxHighlighter language={match[1]} {...props}>
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
