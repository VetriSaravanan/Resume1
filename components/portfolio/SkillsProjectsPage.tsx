import React from 'react';
import type { ResumeData, TemplateTheme, Project, Certification, VolunteerWork, Publication, Language } from '../../types';
import AwardIcon from '../icons/AwardIcon';
import EditableField from '../../EditableField';
import TrashIcon from '../icons/TrashIcon';
import GripVerticalIcon from '../icons/GripVerticalIcon';
import ExternalLinkIcon from '../icons/ExternalLinkIcon';
import DraggableList from '../DraggableList';

interface DetailsPageProps {
    data: ResumeData;
    template: TemplateTheme;
    isEditing: boolean;
    setResumeData: React.Dispatch<React.SetStateAction<ResumeData | null>>;
    isExporting?: boolean;
    resumeData: ResumeData;
}

type ArraySectionKey = {
    [K in keyof ResumeData]: NonNullable<ResumeData[K]> extends { id: string }[] ? K : never
}[keyof ResumeData];

const themeStyles: Record<TemplateTheme, any> = {
    tech: { 
        header: 'text-tech-accent dark:text-tech-dark-accent border-gray-200 dark:border-white/10', 
        skillBg: 'bg-white dark:bg-tech-dark-card border border-gray-200 dark:border-white/10', 
        skillText: 'text-tech-accent dark:text-tech-dark-accent', 
        itemBg: 'bg-tech-card dark:bg-tech-dark-card border border-gray-100 dark:border-white/10',
        title: 'text-tech-text dark:text-white',
        subtitle: 'text-tech-accent dark:text-tech-dark-accent',
        text: 'text-tech-subtext dark:text-gray-300',
        date: 'text-gray-500 dark:text-gray-400',
        link: 'text-tech-accent dark:text-tech-dark-accent hover:underline',
        icon: 'text-tech-accent dark:text-tech-dark-accent',
        projectTechBg: 'bg-gray-100 dark:bg-white/5', 
        projectTechText: 'text-tech-accent dark:text-tech-dark-accent',
    },
    professional: { 
        header: 'text-prof-accent dark:text-prof-dark-accent border-gray-200 dark:border-prof-dark-card', 
        skillBg: 'bg-white dark:bg-prof-dark-card border border-gray-200 dark:border-prof-dark-card', 
        skillText: 'text-prof-accent dark:text-prof-dark-accent', 
        itemBg: 'bg-prof-card dark:bg-prof-dark-card border border-gray-200 dark:border-prof-dark-card',
        title: 'text-prof-text dark:text-white',
        subtitle: 'text-prof-accent dark:text-prof-dark-accent',
        text: 'text-prof-subtext dark:text-gray-300',
        date: 'text-gray-500 dark:text-gray-400',
        link: 'text-prof-accent dark:text-prof-dark-accent hover:underline',
        icon: 'text-prof-accent dark:text-prof-dark-accent',
        projectTechBg: 'bg-gray-100 dark:bg-prof-dark-bg', 
        projectTechText: 'text-prof-accent dark:text-prof-dark-accent',
    },
    creative: { 
        header: 'text-creative-accent dark:text-creative-dark-accent border-rose-200 dark:border-creative-dark-card', 
        skillBg: 'bg-white dark:bg-creative-dark-card border border-rose-100 dark:border-transparent', 
        skillText: 'text-creative-accent dark:text-creative-dark-accent', 
        itemBg: 'bg-creative-card dark:bg-creative-dark-card border border-rose-100 dark:border-transparent shadow-lg',
        title: 'text-creative-text dark:text-white',
        subtitle: 'text-white',
        text: 'text-creative-subtext dark:text-gray-300',
        date: 'text-gray-500 dark:text-gray-400',
        link: 'text-creative-accent dark:text-creative-dark-accent hover:underline',
        icon: 'text-creative-accent dark:text-creative-dark-accent',
        projectTechBg: 'bg-rose-50 dark:bg-creative-dark-bg', 
        projectTechText: 'text-creative-accent dark:text-creative-dark-accent',
    },
    minimal: { 
        header: 'text-minimal-text dark:text-white border-gray-200 dark:border-gray-800', 
        skillBg: 'bg-white dark:bg-minimal-dark-card border border-gray-200 dark:border-gray-800', 
        skillText: 'text-minimal-text dark:text-white', 
        itemBg: 'bg-minimal-card dark:bg-minimal-dark-card border border-gray-200 dark:border-gray-800',
        title: 'text-minimal-text dark:text-white',
        subtitle: 'text-gray-500 dark:text-gray-400',
        text: 'text-minimal-subtext dark:text-gray-300',
        date: 'text-gray-500 dark:text-gray-400',
        link: 'text-minimal-text dark:text-white hover:underline',
        icon: 'text-minimal-text dark:text-white',
        projectTechBg: 'bg-gray-100 dark:bg-gray-800', 
        projectTechText: 'text-minimal-text dark:text-white',
    },
    executive: { 
        header: 'text-executive-accent dark:text-executive-dark-accent border-gray-300 dark:border-gray-700', 
        skillBg: 'bg-white dark:bg-executive-dark-card border border-gray-200 dark:border-gray-700', 
        skillText: 'text-executive-accent dark:text-executive-dark-accent', 
        itemBg: 'bg-executive-card dark:bg-executive-dark-card border border-gray-200 dark:border-transparent shadow-md',
        title: 'text-executive-text dark:text-white',
        subtitle: 'text-executive-accent dark:text-executive-dark-accent',
        text: 'text-executive-subtext dark:text-gray-300',
        date: 'text-gray-500 dark:text-gray-400',
        link: 'text-executive-accent dark:text-executive-dark-accent hover:underline',
        icon: 'text-executive-accent dark:text-executive-dark-accent',
        projectTechBg: 'bg-gray-100 dark:bg-executive-dark-bg', 
        projectTechText: 'text-executive-text dark:text-executive-dark-accent',
    },
    matrix: { 
        header: 'text-matrix-light-accent dark:text-matrix-accent border-matrix-light-accent/20 dark:border-matrix-accent/20', 
        skillBg: 'bg-matrix-light-card dark:bg-matrix-card border border-matrix-light-accent/20 dark:border-matrix-accent/20', 
        skillText: 'text-matrix-light-accent dark:text-matrix-accent', 
        itemBg: 'bg-matrix-light-card dark:bg-matrix-card border border-matrix-light-accent/20 dark:border-matrix-accent/20 backdrop-blur-sm',
        title: 'text-matrix-light-text dark:text-matrix-text',
        subtitle: 'text-white',
        text: 'text-matrix-light-text dark:text-matrix-subtext',
        date: 'text-matrix-light-text dark:text-matrix-subtext',
        link: 'text-matrix-light-accent dark:text-matrix-accent hover:underline',
        icon: 'text-matrix-light-accent dark:text-matrix-accent',
        projectTechBg: 'bg-matrix-light-accent/10 dark:bg-matrix-accent/10', 
        projectTechText: 'text-matrix-light-accent dark:text-matrix-accent',
    },
};

const Section: React.FC<{title: string; headerClass: string; children: React.ReactNode; className?: string, useAnimations?: boolean;}> = ({ title, headerClass, children, className, useAnimations }) => (
    <section className={className}>
        <h2 className={`text-3xl font-bold mb-6 border-b-2 pb-2 ${headerClass} ${useAnimations ? 'animate-on-scroll' : ''}`}>{title}</h2>
        {children}
    </section>
);

// Generic Section Renderer for Draggable Lists
const SectionRenderer = <T extends { id: string }>({
    title,
    sectionKey,
    items,
    styles,
    ...props
}: {
    title: string;
    sectionKey: ArraySectionKey;
    items: T[] | undefined;
    styles: Record<string, any>;
    isEditing: boolean;
    isExporting?: boolean;
    setResumeData: React.Dispatch<React.SetStateAction<ResumeData | null>>;
    renderItem: (item: T, index: number) => React.ReactNode;
    listClassName?: string;
    useAnimations?: boolean;
}) => {
    if (!items || items.length === 0) return null;

    return (
        <Section title={title} headerClass={styles.header} className="print-page-break" useAnimations={props.useAnimations}>
            <DraggableList<T>
                items={items}
                setItems={newItems => props.setResumeData(prev => prev ? { ...prev, [sectionKey]: newItems } : null)}
                isEditing={props.isEditing}
                isExporting={props.isExporting}
                className={props.listClassName}
            >
                {(item, index) => props.renderItem(item, index)}
            </DraggableList>
        </Section>
    );
};


const DetailsPage: React.FC<DetailsPageProps> = ({ data, template, isEditing, setResumeData, isExporting, resumeData }) => {
    const styles = themeStyles[template];
    // Use animations if enabled in data. Default to true if undefined for backward compatibility or new resumes
    const useAnimations = !!resumeData.enableAnimations;
    
    const ensureAbsoluteUrl = (url?: string): string => {
        if (!url) return '#';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `https://${url}`;
    };
    
    type ItemOf<S extends keyof ResumeData> = NonNullable<ResumeData[S]> extends (infer I)[] ? I : never;
    
    const handleItemFieldChange = <S extends ArraySectionKey>(
      section: S,
      id: string,
      field: keyof ItemOf<S>,
    ) => (value: string) => {
      setResumeData(prevData => {
          if (!prevData) return null;
          const sectionData = (prevData[section] as unknown as ((ItemOf<S> & { id: string })[] | undefined)) || [];
          const updatedItems = sectionData.map(item =>
            item.id === id ? { ...item, [field]: value } : item,
          );
          return { ...prevData, [section]: updatedItems as any };
      });
    };

    const handleItemArrayFieldChange = <S extends ArraySectionKey>(
        section: S,
        id: string,
        field: keyof ItemOf<S>,
        index: number,
      ) => (value: string) => {
        setResumeData(prevData => {
            if (!prevData) return null;
            const sectionData = (prevData[section] as unknown as ((ItemOf<S> & { id: string })[] | undefined)) || [];
            const updatedItems = sectionData.map(item => {
                if (item.id === id) {
                    const currentArray = item[field] as unknown as string[];
                    const newArray = [...(Array.isArray(currentArray) ? currentArray : [])];
                    newArray[index] = value;
                    return { ...item, [field]: newArray };
                }
                return item;
            });
            return { ...prevData, [section]: updatedItems as any };
        });
      };

    const handleItemDelete = <K extends ArraySectionKey>(section: K, id: string) => {
        setResumeData(prevData => {
            if (!prevData) return null;
            const sectionData = (prevData[section] as { id: string }[] | undefined) || [];
            return { ...prevData, [section]: sectionData.filter(item => item.id !== id) as any };
        });
    };
    
    const commonProps = { isEditing, isExporting, setResumeData, styles, useAnimations };

    return (
        <div className="space-y-12">
            {data.skills?.length > 0 && (
                <Section title="Skills" headerClass={styles.header} useAnimations={useAnimations}>
                    <div className="flex flex-wrap gap-3">
                         {(data.skills || []).map((skill, index) => (
                            <div key={skill.id} className={`relative group text-md font-semibold px-4 py-2 rounded-lg ${styles.skillBg} ${styles.skillText} ${useAnimations ? 'animate-on-scroll' : ''}`} style={{transitionDelay: `${index * 50}ms`}}>
                                <EditableField isEditing={isEditing} isExporting={isExporting} value={skill.name} onChange={handleItemFieldChange('skills', skill.id, 'name')} />
                                {isEditing && !isExporting && <button onClick={() => handleItemDelete('skills', skill.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>}
                            </div>
                        ))}
                    </div>
                </Section>
            )}
            
            <SectionRenderer<Project>
                title="Projects"
                sectionKey="projects"
                items={data.projects}
                {...commonProps}
                listClassName="grid grid-cols-1 md:grid-cols-2 gap-8"
                renderItem={(project, index) => (
                    <div className={`group relative p-6 rounded-lg shadow-lg flex flex-col h-full ${styles.itemBg} ${template === 'matrix' ? 'transition-transform duration-300 [transform-style:preserve-3d] group-hover:scale-105 group-hover:[transform:rotateY(10deg)_rotateX(5deg)]' : ''} ${useAnimations ? 'animate-on-scroll' : ''}`} style={useAnimations ? { transitionDelay: `${200 + index * 100}ms` } : {}}>
                        {isEditing && !isExporting && (
                        <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
                            <button className="cursor-move p-1 text-gray-400 hover:text-white"><GripVerticalIcon /></button>
                            <button onClick={() => handleItemDelete('projects', project.id)} className="p-1 text-red-500 hover:text-red-400"><TrashIcon /></button>
                        </div>
                    )}
                    <EditableField as="h3" isEditing={isEditing} isExporting={isExporting} value={project.name} onChange={handleItemFieldChange('projects', project.id, 'name')} className={`text-2xl font-bold mb-2 ${styles.title}`} />
                    <EditableField as="textarea" isEditing={isEditing} isExporting={isExporting} value={project.description} onChange={handleItemFieldChange('projects', project.id, 'description')} className={`flex-grow mb-4 ${styles.text}`} />
                    <div className="flex flex-wrap gap-2 mb-4">
                        {(project.technologies || []).map((tech, i) => (
                            <span key={i} className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles.projectTechBg} ${styles.projectTechText}`}>{tech}</span>
                        ))}
                    </div>
                        {(!isEditing && project.link) ? (
                        <a href={ensureAbsoluteUrl(project.link)} target="_blank" rel="noopener noreferrer" className={`font-semibold self-start flex items-center gap-2 ${styles.link}`}>
                            <ExternalLinkIcon className="w-4 h-4" />
                            View Project
                        </a>
                    ) : (
                        <EditableField isEditing={isEditing} isExporting={isExporting} value={project.link || ''} onChange={handleItemFieldChange('projects', project.id, 'link')} placeholder="Project Link" className={`font-semibold self-start ${styles.link}`} />
                    )}
                </div>
                )}
            />

            <SectionRenderer<Certification>
                title="Certifications"
                sectionKey="certifications"
                items={data.certifications}
                {...commonProps}
                listClassName="space-y-6"
                renderItem={(cert, index) => (
                    <div className={`relative flex items-start space-x-4 p-4 rounded-lg ${styles.itemBg} ${useAnimations ? 'animate-on-scroll' : ''}`} style={useAnimations ? { transitionDelay: `${200 + index * 100}ms` } : {}}>
                        {isEditing && !isExporting && (
                            <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
                                <button className="cursor-move p-1 text-gray-400 hover:text-white"><GripVerticalIcon /></button>
                                <button onClick={() => handleItemDelete('certifications', cert.id)} className="p-1 text-red-500 hover:text-red-400"><TrashIcon /></button>
                            </div>
                        )}
                        <AwardIcon className={`w-8 h-8 flex-shrink-0 mt-1 ${styles.icon}`} />
                        <div className="flex-grow">
                            <EditableField as="h3" isEditing={isEditing} isExporting={isExporting} value={cert.name} onChange={handleItemFieldChange('certifications', cert.id, 'name')} className={`text-xl font-bold ${styles.title}`} />
                            <EditableField as="p" isEditing={isEditing} isExporting={isExporting} value={cert.issuer} onChange={handleItemFieldChange('certifications', cert.id, 'issuer')} className={`text-md ${styles.text}`} />
                            <EditableField as="p" isEditing={isEditing} isExporting={isExporting} value={cert.date} onChange={handleItemFieldChange('certifications', cert.id, 'date')} className={`text-sm ${styles.date}`} />
                        </div>
                    </div>
                )}
            />

             <SectionRenderer<VolunteerWork>
                title="Volunteer Work"
                sectionKey="volunteerWork"
                items={data.volunteerWork}
                {...commonProps}
                listClassName="space-y-6"
                renderItem={(work, index) => (
                    <div className={`relative p-6 rounded-lg ${styles.itemBg} ${useAnimations ? 'animate-on-scroll' : ''}`} style={useAnimations ? { transitionDelay: `${200 + index * 100}ms` } : {}}>
                        {isEditing && !isExporting && (
                            <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
                                <button className="cursor-move p-1 text-gray-400 hover:text-white"><GripVerticalIcon /></button>
                                <button onClick={() => handleItemDelete('volunteerWork', work.id)} className="p-1 text-red-500 hover:text-red-400"><TrashIcon /></button>
                            </div>
                        )}
                        <EditableField as="p" isEditing={isEditing} isExporting={isExporting} value={work.dates} onChange={handleItemFieldChange('volunteerWork', work.id, 'dates')} className={`text-sm ${styles.date}`} />
                        <EditableField as="h3" isEditing={isEditing} isExporting={isExporting} value={work.organization} onChange={handleItemFieldChange('volunteerWork', work.id, 'organization')} className={`text-2xl font-bold ${styles.title}`} />
                        <EditableField as="p" isEditing={isEditing} isExporting={isExporting} value={work.role} onChange={handleItemFieldChange('volunteerWork', work.id, 'role')} className={`text-lg mb-3 ${styles.subtitle}`} />
                        <ul className={`list-disc pl-5 space-y-2 ${styles.text}`}>
                            {(work.description || []).map((desc, i) => (
                                <EditableField as="li" key={i} isEditing={isEditing} isExporting={isExporting} value={desc} onChange={handleItemArrayFieldChange('volunteerWork', work.id, 'description', i)} />
                            ))}
                        </ul>
                    </div>
                )}
            />

            <SectionRenderer<Publication>
                title="Publications"
                sectionKey="publications"
                items={data.publications}
                {...commonProps}
                listClassName="space-y-6"
                renderItem={(pub, index) => (
                     <div className={`relative p-6 rounded-lg ${styles.itemBg} ${useAnimations ? 'animate-on-scroll' : ''}`} style={useAnimations ? { transitionDelay: `${200 + index * 100}ms` } : {}}>
                        {isEditing && !isExporting && (
                            <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
                                <button className="cursor-move p-1 text-gray-400 hover:text-white"><GripVerticalIcon /></button>
                                <button onClick={() => handleItemDelete('publications', pub.id)} className="p-1 text-red-500 hover:text-red-400"><TrashIcon /></button>
                            </div>
                        )}
                        <EditableField as="p" isEditing={isEditing} isExporting={isExporting} value={pub.date} onChange={handleItemFieldChange('publications', pub.id, 'date')} className={`text-sm ${styles.date}`} />
                        <EditableField as="h3" isEditing={isEditing} isExporting={isExporting} value={pub.title} onChange={handleItemFieldChange('publications', pub.id, 'title')} className={`text-2xl font-bold ${styles.title}`} />
                        <EditableField as="p" isEditing={isEditing} isExporting={isExporting} value={pub.publisher} onChange={handleItemFieldChange('publications', pub.id, 'publisher')} className={`text-lg mb-3 ${styles.subtitle}`} />
                        <EditableField as="textarea" isEditing={isEditing} isExporting={isExporting} value={pub.description || ''} onChange={handleItemFieldChange('publications', pub.id, 'description')} className={`mb-3 ${styles.text}`} />
                            {(!isEditing && pub.link) ? (
                            <a href={ensureAbsoluteUrl(pub.link)} target="_blank" rel="noopener noreferrer" className={`font-semibold self-start flex items-center gap-2 ${styles.link}`}>
                                <ExternalLinkIcon className="w-4 h-4" />
                                View Publication
                            </a>
                        ) : (
                            <EditableField isEditing={isEditing} isExporting={isExporting} value={pub.link || ''} onChange={handleItemFieldChange('publications', pub.id, 'link')} placeholder="Publication Link" className={`font-semibold self-start ${styles.link}`} />
                        )}
                    </div>
                )}
            />

            {data.languages?.length > 0 && (
                <Section title="Languages" headerClass={styles.header} useAnimations={useAnimations}>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {(data.languages || []).map((lang, index) => (
                             <div key={lang.id} className={`relative group text-center p-4 rounded-lg ${styles.itemBg} ${useAnimations ? 'animate-on-scroll' : ''}`} style={{transitionDelay: `${index * 50}ms`}}>
                                 <EditableField isEditing={isEditing} isExporting={isExporting} value={lang.name} onChange={handleItemFieldChange('languages', lang.id, 'name')} className={`text-lg font-bold ${styles.title}`} />
                                 <EditableField isEditing={isEditing} isExporting={isExporting} value={lang.proficiency} onChange={handleItemFieldChange('languages', lang.id, 'proficiency')} className={`text-md ${styles.subtitle}`} />
                                {isEditing && !isExporting && <button onClick={() => handleItemDelete('languages', lang.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>}
                            </div>
                        ))}
                    </div>
                </Section>
            )}

             {data.hobbies?.length > 0 && (
                <Section title="Hobbies" headerClass={styles.header} useAnimations={useAnimations}>
                     <div className="flex flex-wrap gap-3">
                         {(data.hobbies || []).map((hobby, index) => (
                            <div key={hobby.id} className={`relative group text-md font-semibold px-4 py-2 rounded-lg ${styles.skillBg} ${styles.text} ${useAnimations ? 'animate-on-scroll' : ''}`} style={{transitionDelay: `${index * 50}ms`}}>
                                <EditableField isEditing={isEditing} isExporting={isExporting} value={hobby.name} onChange={handleItemFieldChange('hobbies', hobby.id, 'name')} />
                                {isEditing && !isExporting && <button onClick={() => handleItemDelete('hobbies', hobby.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>}
                            </div>
                        ))}
                    </div>
                </Section>
            )}
        </div>
    );
};

export default DetailsPage;