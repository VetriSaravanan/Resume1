import React from 'react';
import type { ResumeData, TemplateTheme, SectionType } from '../../types';
import Header, { themeStyles } from './Header';
import HomePage from './HomePage';
import ExperiencePage from './ExperiencePage';
import EducationPage from './EducationPage';
import SkillsProjectsPage from './SkillsProjectsPage';

interface PortfolioExportProps {
    resumeData: ResumeData;
    template: TemplateTheme;
    isDarkMode: boolean;
}

const getSPARouterScript = (template: TemplateTheme): string => {
    const styles = themeStyles[template];
    const activeClasses = `${styles.linkActive} ${styles.linkActiveText}`.trim();
    const inactiveClasses = `${styles.linkInactive} ${styles.linkHover}`.trim();

    const allClasses = new Set<string>();
    Object.values(themeStyles).forEach(theme => {
        `${theme.linkActive} ${theme.linkActiveText} ${theme.linkInactive} ${theme.linkHover}`
            .split(' ')
            .filter(Boolean)
            .forEach(cls => allClasses.add(cls));
    });
    const allPossibleClasses = JSON.stringify(Array.from(allClasses));

    return `
function showPage(pageId) {
    var targetPageId = pageId || 'home';
    document.querySelectorAll('[data-page]').forEach(function(p) {
        p.style.display = p.getAttribute('data-page') === targetPageId ? 'block' : 'none';
    });
    
    var navLinks = document.querySelectorAll('header nav a');
    var activeClasses = '${activeClasses}'.split(' ').filter(Boolean);
    var inactiveClasses = '${inactiveClasses}'.split(' ').filter(Boolean);
    var allPossibleClasses = ${allPossibleClasses};

    navLinks.forEach(function(link) {
        var linkHref = link.getAttribute('href') || '';
        var linkPageId = linkHref.replace('#/', '') || 'home';
        
        link.classList.remove.apply(link.classList, allPossibleClasses);

        if (linkPageId === targetPageId) {
            link.classList.add.apply(link.classList, activeClasses);
        } else {
            link.classList.add.apply(link.classList, inactiveClasses);
        }
    });
    window.scrollTo(0, 0);
}

function handleRouteChange() {
    var hash = window.location.hash || '#/';
    var pageId = hash.substring(2);
    showPage(pageId);
}

window.addEventListener('hashchange', handleRouteChange);
document.addEventListener('DOMContentLoaded', function() {
    handleRouteChange();
});
    `;
};


const PortfolioExport: React.FC<PortfolioExportProps> = ({ resumeData, template, isDarkMode }) => {
    const { name, title, sectionOrder } = resumeData;

    const backgroundClass = (() => {
        switch (template) {
             case 'tech':
                return 'bg-tech-bg dark:bg-tech-dark-bg text-tech-text dark:text-tech-dark-text font-sans';
            case 'professional':
                return 'bg-prof-bg dark:bg-prof-dark-bg text-prof-text dark:text-prof-dark-text font-serif';
            case 'creative':
                return 'bg-creative-bg dark:bg-creative-dark-bg text-creative-text dark:text-creative-dark-text font-sans';
            case 'minimal':
                return 'bg-minimal-bg dark:bg-minimal-dark-bg text-minimal-text dark:text-minimal-dark-text font-sans';
            case 'executive':
                return 'bg-executive-bg dark:bg-executive-dark-bg text-executive-text dark:text-executive-dark-text font-serif';
            case 'matrix':
                return 'matrix-bg text-matrix-light-text dark:text-matrix-text font-mono';
            default:
                return 'bg-primary text-gray-200';
        }
    })();
    
    const spaNavLinks = [{ to: "#/", text: "Home" }];
    sectionOrder.forEach(sectionId => {
        switch(sectionId) {
            case 'experience':
                if (resumeData.experience?.length > 0) spaNavLinks.push({ to: '#/experience', text: 'Experience' });
                break;
            case 'education':
                if (resumeData.education?.length > 0) spaNavLinks.push({ to: '#/education', text: 'Education' });
                break;
            case 'details':
                spaNavLinks.push({ to: '#/details', text: 'Details' });
                break;
        }
    });

    const htmlClass = isDarkMode ? 'dark' : '';
    
    const renderPageContent = (page: 'home' | SectionType) => {
        switch(page) {
            case 'home':
                return <HomePage data={resumeData} setResumeData={() => {}} template={template} isEditing={false} isExporting={true} />;
            case 'experience':
                 if (!resumeData.experience?.length) return null;
                return <ExperiencePage data={resumeData.experience} resumeData={resumeData} setResumeData={() => {}} template={template} isEditing={false} isExporting={true} />;
            case 'education':
                if (!resumeData.education?.length) return null;
                return <EducationPage data={resumeData.education} resumeData={resumeData} setResumeData={() => {}} template={template} isEditing={false} isExporting={true} />;
            case 'details':
                return <SkillsProjectsPage data={resumeData} resumeData={resumeData} setResumeData={() => {}} template={template} isEditing={false} isExporting={true} />;
            default:
                return null;
        }
    };

    return (
        <html lang="en" className={htmlClass}>
        <head>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>{`${name} | ${title}`}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Lora:ital,wght@0,400..700;1,400..700&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&family=Playfair+Display:wght@400;600;700;800&family=Merriweather:wght@300;400;700&family=Montserrat:wght@300;400;500;600;700&family=Lato:wght@300;400;700&family=Oswald:wght@400;500;700&family=Open+Sans:wght@300;400;600;700&family=Raleway:wght@300;400;600;700&family=Source+Sans+3:wght@300;400;600&family=Poppins:wght@300;400;500;600;700&family=Nunito:wght@300;400;600;700&display=swap" rel="stylesheet" />
            <script src="https://cdn.tailwindcss.com"></script>
            <script dangerouslySetInnerHTML={{ __html: `
                tailwind.config = {
                    darkMode: 'class',
                    theme: {
                        extend: {
                            fontFamily: {
                                sans: ['Inter', 'sans-serif'],
                                serif: ['Lora', 'serif'],
                                mono: ['Roboto Mono', 'monospace'],
                            },
                             colors: {
                                'primary': '#030014',
                                'secondary': '#1c1827',
                                'accent': '#8b5cf6',

                                // Tech Theme
                                'tech-bg': '#f8fafc',
                                'tech-card': '#ffffff',
                                'tech-text': '#0f172a',
                                'tech-subtext': '#475569',
                                'tech-accent': '#7c3aed',
                                'tech-dark-bg': '#030014',
                                'tech-dark-card': '#111827',
                                'tech-dark-text': '#e2e8f0',
                                'tech-dark-subtext': '#94a3b8',
                                'tech-dark-accent': '#7c3aed',

                                // Professional Theme
                                'prof-bg': '#f3f4f6',
                                'prof-card': '#ffffff',
                                'prof-text': '#111827',
                                'prof-subtext': '#4b5563',
                                'prof-accent': '#0369a1', 
                                'prof-dark-bg': '#111827',
                                'prof-dark-card': '#1f2937',
                                'prof-dark-text': '#f9fafb',
                                'prof-dark-subtext': '#9ca3af',
                                'prof-dark-accent': '#38bdf8',

                                // Creative Theme
                                'creative-bg': '#fff1f2',
                                'creative-card': '#ffffff',
                                'creative-text': '#881337',
                                'creative-subtext': '#9f1239',
                                'creative-accent': '#e11d48',
                                'creative-dark-bg': '#1a050b',
                                'creative-dark-card': '#3e0d1e',
                                'creative-dark-text': '#fff1f2',
                                'creative-dark-subtext': '#ffffff',
                                'creative-dark-accent': '#fb7185',

                                // Minimal Theme
                                'minimal-bg': '#ffffff',
                                'minimal-card': '#ffffff',
                                'minimal-text': '#000000',
                                'minimal-subtext': '#52525b',
                                'minimal-accent': '#000000',
                                'minimal-dark-bg': '#000000',
                                'minimal-dark-card': '#18181b',
                                'minimal-dark-text': '#ffffff',
                                'minimal-dark-subtext': '#a1a1aa',
                                'minimal-dark-accent': '#ffffff',

                                // Executive Theme
                                'executive-bg': '#f8fafc',
                                'executive-card': '#ffffff',
                                'executive-text': '#0f172a',
                                'executive-subtext': '#334155',
                                'executive-accent': '#b45309', 
                                'executive-dark-bg': '#0f172a',
                                'executive-dark-card': '#1e293b',
                                'executive-dark-text': '#f8fafc',
                                'executive-dark-subtext': '#cbd5e1',
                                'executive-dark-accent': '#fbbf24',

                                // Matrix Theme
                                'matrix-bg': '#000000',
                                'matrix-card': '#0a0a0a',
                                'matrix-text': '#00ff41',
                                'matrix-subtext': '#ffffff',
                                'matrix-accent': '#00ff41',
                                'matrix-light-bg': '#f0fdf4',
                                'matrix-light-card': '#ffffff',
                                'matrix-light-text': '#14532d',
                                'matrix-light-accent': '#16a34a',
                            },
                        }
                    }
                }
            `}} />
            {/* Fix: Using dangerouslySetInnerHTML for the style tag to prevent JSX parsing issues with CSS syntax. */}
            <style dangerouslySetInnerHTML={{ __html: `
                body {
                    font-family: 'Inter', sans-serif;
                }
                 .matrix-bg {
                    background-color: #000000;
                    background-image: 
                        linear-gradient(rgba(0, 255, 65, 0.07) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 255, 65, 0.07) 1px, transparent 1px);
                    background-size: 3rem 3rem;
                    background-position: center center;
                }
                 ${resumeData.fonts?.heading ? `h1, h2, h3, h4, h5, h6, .font-heading, .font-serif, .font-sans, .font-mono { font-family: ${resumeData.fonts.heading} !important; }` : ''}
                 ${resumeData.fonts?.body ? `body, p, li, a, span, input, textarea, .font-body { font-family: ${resumeData.fonts.body} !important; }` : ''}
            `}} />
        </head>
        <body className={`min-h-screen transition-colors duration-300 ${backgroundClass}`}>
            <Header 
                name={resumeData.name} 
                onSignOut={() => {}}
                onSave={() => {}}
                saveStatus='idle'
                template={template} 
                navLinks={spaNavLinks}
                isEditorOpen={false}
                setIsEditorOpen={() => {}}
                undo={() => {}}
                redo={() => {}}
                canUndo={false}
                canRedo={false}
                onDownload={() => {}}
                onDeploy={() => {}}
                isExporting={true}
            />
             <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div data-page="home">{renderPageContent('home')}</div>
                <div data-page="experience" style={{display: 'none'}}>{renderPageContent('experience')}</div>
                <div data-page="education" style={{display: 'none'}}>{renderPageContent('education')}</div>
                <div data-page="details" style={{display: 'none'}}>{renderPageContent('details')}</div>
            </main>
            <script dangerouslySetInnerHTML={{ __html: getSPARouterScript(template) }} />
        </body>
        </html>
    );
};

export default PortfolioExport;