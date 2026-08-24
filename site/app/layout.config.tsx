import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <span className="spec-nav-mark">FlowDrop</span>
        <span className="spec-nav-title">Workflow Specification</span>
      </>
    ),
  },
  links: [
    { text: 'All rules', url: '/rules' },
    { text: 'Conventions', url: '/conventions' },
    { text: 'Glossary', url: '/glossary' },
  ],
};
