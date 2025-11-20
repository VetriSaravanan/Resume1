import React from 'react';
import type { Education, TemplateTheme, ResumeData } from '../../types';
import GraduationCapIcon from '../icons/GraduationCapIcon';
import EditableField from '../../EditableField';
import TrashIcon from '../icons/TrashIcon';
import GripVerticalIcon from '../icons/GripVerticalIcon';
import DraggableList from '../DraggableList';

interface EducationPageProps {
    data: Education[];
    template: TemplateTheme;
    isEditing: boolean;
    setResumeData: React.Dispatch<React.SetStateAction<ResumeData | null>>;
    resumeData: ResumeData;
    isExporting?: boolean;
}

const themeStyles: Record<TemplateTheme, {
    header: string; itemBg: string; icon: string; date: string; title: string; subtitle: string; text: string;
}> = {
    tech: { 
        header: 'text-tech-accent dark:text-tech-dark-accent border-gray-200 dark:border-white/10', 
        itemBg: 'bg-tech-card dark:bg-tech-dark-card border border-gray-100 dark:border-white/10 shadow-sm', 
        icon: 'text-tech-accent dark:text-tech-dark-accent', 
        date: 'text-gray-500 dark:text-gray-400', 
        title: 'text-tech-text dark:text-white', 
        subtitle: 'text-gray-600 dark:text-gray-300', 
        text: 'text-tech-subtext dark:text-gray-400' 
    },
    professional: { 
        header: 'text-prof-accent dark:text-prof-dark-accent border-gray-200 dark:border-prof-dark-card', 
        itemBg: 'bg-prof-card dark:bg-prof-dark-card border border-gray-200 dark:border-prof-dark-card shadow-sm', 
        icon: 'text-prof-accent dark:text-prof-dark-accent', 
        date: 'text-gray-500 dark:text-gray-400', 
        title: 'text-prof-text dark:text-white', 
        subtitle: 'text-gray-600 dark:text-gray-300', 
        text: 'text-prof-subtext dark:text-gray-400' 
    },
    creative: { 
        header: 'text-creative-accent dark:text-creative-dark-accent border-rose-200 dark:border-creative-dark-card', 
        itemBg: 'bg-creative-card dark:bg-creative-dark-card border-l-4 border-creative-accent dark:border-creative-dark-accent shadow-lg', 
        icon: 'text-creative-accent dark:text-creative-dark-accent', 
        date: 'text-gray-500 dark:text-gray-400', 
        title: 'text-creative-text dark:text-white', 
        subtitle: 'text-gray-600 dark:text-gray-300', 
        text: 'text-creative-subtext dark:text-gray-400' 
    },
    minimal: { 
        header: 'text-minimal-text dark:text-white border-gray-200 dark:border-gray-800', 
        itemBg: 'bg-minimal-card dark:bg-minimal-dark-card border border-gray-200 dark:border-gray-800', 
        icon: 'text-minimal-text dark:text-white', 
        date: 'text-gray-500 dark:text-gray-400', 
        title: 'text-minimal-text dark:text-white', 
        subtitle: 'text-gray-600 dark:text-gray-300', 
        text: 'text-minimal-subtext dark:text-gray-400' 
    },
    executive: { 
        header: 'text-executive-accent dark:text-executive-dark-accent border-gray-300 dark:border-gray-700', 
        itemBg: 'bg-executive-card dark:bg-executive-dark-card border border-gray-200 dark:border-transparent shadow-md', 
        icon: 'text-executive-accent dark:text-executive-dark-accent', 
        date: 'text-gray-500 dark:text-gray-400', 
        title: 'text-executive-text dark:text-white', 
        subtitle: 'text-gray-600 dark:text-gray-300', 
        text: 'text-executive-subtext dark:text-gray-400' 
    },
    matrix: { 
        header: 'text-matrix-light-accent dark:text-matrix-accent border-matrix-light-accent/20 dark:border-matrix-accent/20', 
        itemBg: 'bg-matrix-light-card dark:bg-matrix-card border border-matrix-light-accent/20 dark:border-matrix-accent/20 backdrop-blur-sm', 
        icon: 'text-matrix-light-accent dark:text-matrix-accent', 
        date: 'text-matrix-light-text dark:text-matrix-subtext', 
        title: 'text-matrix-light-text dark:text-matrix-text', 
        subtitle: 'text-gray-600 dark:text-matrix-subtext', 
        text: 'text-matrix-light-text dark:text-matrix-subtext' 
    },
};

const EducationPage: React.FC<EducationPageProps> = ({ data, template, isEditing, setResumeData, isExporting, resumeData }) => {
    const styles = themeStyles[template];
    // Use animations if enabled in data. Default to true if undefined for backward compatibility or new resumes
    const useAnimations = !!resumeData.enableAnimations;

     const handleFieldChange = (id: string, field: keyof Education) => (value: string) => {
        setResumeData(prevData => {
            if (!prevData) return null;
            const updatedEducation = prevData.education.map(edu =>
                edu.id === id ? { ...edu, [field]: value } : edu
            );
            return { ...prevData, education: updatedEducation };
        });
    };

    const handleDelete = (id: string) => {
        setResumeData(prevData => {
            if (!prevData) return null;
            return { ...prevData, education: prevData.education.filter(edu => edu.id !== id) };
        });
    };
    
    const handleReorder = (newEducation: Education[]) => {
        setResumeData(prev => prev ? { ...prev, education: newEducation } : null);
    };

    return (
        <div className="print-page-break">
            <h1 className={`text-4xl font-bold mb-8 border-b-2 pb-4 ${styles.header} ${useAnimations ? 'animate-on-scroll' : ''}`}>Education</h1>
            <DraggableList<Education>
                items={data}
                setItems={handleReorder}
                isEditing={isEditing}
                isExporting={isExporting}
                className="space-y-8"
            >
                {(edu, index) => (
                    <div 
                        className={`relative flex items-start space-x-4 p-6 rounded-lg shadow-lg ${styles.itemBg} ${useAnimations ? 'animate-on-scroll' : ''}`}
                        style={useAnimations ? { transitionDelay: `${100 + index * 100}ms` } : {}}
                    >
                        {isEditing && !isExporting && (
                            <div className="absolute top-2 right-2 flex items-center gap-2">
                                <button className="cursor-move p-1 text-gray-400 hover:text-white"><GripVerticalIcon /></button>
                                <button onClick={() => handleDelete(edu.id)} className="p-1 text-red-500 hover:text-red-400"><TrashIcon /></button>
                            </div>
                        )}
                        <div className="flex-shrink-0 mt-1">
                            <GraduationCapIcon className={`w-8 h-8 ${styles.icon}`} />
                        </div>
                        <div className="flex-grow">
                            <EditableField as="p" isEditing={isEditing} isExporting={isExporting} value={edu.dates} onChange={handleFieldChange(edu.id, 'dates')} className={`text-sm ${styles.date}`} />
                            <EditableField as="h3" isEditing={isEditing} isExporting={isExporting} value={edu.institution} onChange={handleFieldChange(edu.id, 'institution')} className={`text-2xl font-bold ${styles.title}`} />
                            <EditableField as="p" isEditing={isEditing} isExporting={isExporting} value={edu.degree} onChange={handleFieldChange(edu.id, 'degree')} className={`text-lg ${styles.subtitle}`} />
                            {edu.details && <EditableField as="p" isEditing={isEditing} isExporting={isExporting} value={edu.details} onChange={handleFieldChange(edu.id, 'details')} className={`text-md mt-1 ${styles.text}`} />}
                        </div>
                    </div>
                )}
            </DraggableList>
        </div>
    );
};

export default EducationPage;