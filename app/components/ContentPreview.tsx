'use client';

import React, { useState, useEffect } from 'react';
import { Card, Typography, Divider, Tag, Space, Progress, Button, Input, Modal, message, Tooltip } from 'antd';
import { ClockCircleOutlined, FileTextOutlined, EditOutlined, RobotOutlined, LoadingOutlined, ArrowDownOutlined, QuestionCircleOutlined, LineChartOutlined } from '@ant-design/icons';

interface ContentPreviewProps {
  outline: Array<{
    id: string;
    title: string;
    keywords: string[];
    estimatedWordCount: number;
    sectionType: string;
    optimizationScore: number;
    content?: string;
    uniquenessScore?: number;
    contextualScore?: number;
  }>;
  onContentUpdate?: (sectionId: string, newContent: string) => Promise<void>;
  onGenerateContent?: (sectionId: string, context: { 
    title: string, 
    keywords: string[], 
    type: string,
    previousContent?: string,
    nextContent?: string,
    globalContext?: {
      title: string,
      outline: Array<{ title: string, keywords: string[] }>
    }
  }) => Promise<string>;
}

export default function ContentPreview({ outline, onContentUpdate, onGenerateContent }: ContentPreviewProps) {
  const { Title, Text } = Typography;
  const { TextArea } = Input;
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isProgressModalVisible, setIsProgressModalVisible] = useState(false);
  const [currentGeneratingSection, setCurrentGeneratingSection] = useState<string | null>(null);
  const [generatingProgress, setGeneratingProgress] = useState<Record<string, { 
    status: 'pending' | 'generating' | 'completed' | 'error', 
    message?: string,
    uniquenessScore?: number,
    contextualScore?: number,
    coherenceScore?: number,
    thematicScore?: number,
    narrativeFlowScore?: number
  }>>({});
  const [generationMetrics, setGenerationMetrics] = useState<{
    totalSections: number;
    completedSections: number;
    currentSection: string;
    overallProgress: number;
  }>({ totalSections: 0, completedSections: 0, currentSection: '', overallProgress: 0 });

  // Calculate total estimated reading time (assuming 200 words per minute)
  const totalWordCount = outline.reduce((sum, section) => sum + section.estimatedWordCount, 0);
  const estimatedReadingTime = Math.ceil(totalWordCount / 200);

  // Calculate overall optimization score
  const averageScore = Math.round(
    outline.reduce((sum, section) => sum + section.optimizationScore, 0) / outline.length
  );

  const handleEdit = (section: typeof outline[0]) => {
    setEditingSectionId(section.id);
    setEditingContent(section.content || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editingSectionId && onContentUpdate) {
      try {
        await onContentUpdate(editingSectionId, editingContent);
        message.success('Content updated successfully');
        setIsEditing(false);
        setEditingSectionId(null);
      } catch {
        message.error('Failed to update content');
      }
    }
  };

  const [sections, setSections] = useState(() => outline.map(section => ({
    ...section,
    content: section.content || ''
  })));

  useEffect(() => {
    setSections(prevSections => {
      const updatedSections = outline.map(newSection => {
        const existingSection = prevSections.find(s => s.id === newSection.id);
        return {
          ...newSection,
          content: existingSection?.content || newSection.content || ''
        };
      });
      return updatedSections;
    });
  }, [outline]);

  const handleGenerateAll = async () => {
    if (!onGenerateContent || isGenerating) return;

    setIsGenerating(true);
    const initialProgress = sections.reduce((acc, section) => ({
      ...acc,
      [section.id]: { status: 'pending' as const }
    }), {});
    setGeneratingProgress(initialProgress);
    
    // Initialize generation metrics
    setGenerationMetrics({
      totalSections: sections.length,
      completedSections: 0,
      currentSection: sections[0].title,
      overallProgress: 0
    });
    
    // Show progress modal
    setIsProgressModalVisible(true);

    try {
      const generateForSection = async (section: typeof sections[0], index: number) => {
        setGeneratingProgress(prev => ({
          ...prev,
          [section.id]: { status: 'generating', message: `Generating ${section.title}...` }
        }));

        const previousContent = index > 0 ? sections[index - 1].content : undefined;
        const nextContent = index < sections.length - 1 ? sections[index + 1].content : undefined;

        try {
          const generatedContent = await onGenerateContent(section.id, {
            title: section.title,
            keywords: section.keywords,
            type: section.sectionType,
            previousContent,
            nextContent,
            globalContext: {
              title: sections[0].title,
              outline: sections.map(s => ({ title: s.title, keywords: s.keywords }))
            }
          });

          if (onContentUpdate) {
            await onContentUpdate(section.id, generatedContent);
          }

          const uniquenessScore = calculateUniquenessScore(generatedContent, sections, index);
          const contextualScore = calculateContextualScore(generatedContent, previousContent, nextContent);
          const coherenceScore = calculateCoherence(generatedContent, previousContent || nextContent || '');
          const thematicScore = calculateThematicConnection(generatedContent, previousContent || nextContent || '');
          const narrativeFlowScore = calculateNarrativeFlow(generatedContent, previousContent || '', 'previous') + 
                                 (nextContent ? calculateNarrativeFlow(generatedContent, nextContent, 'next') : 0);

          setGeneratingProgress(prev => ({
            ...prev,
            [section.id]: {
              status: 'completed',
              message: `${section.title} completed`,
              uniquenessScore,
              contextualScore,
              coherenceScore,
              thematicScore,
              narrativeFlowScore: narrativeFlowScore / (nextContent ? 2 : 1) // Average if both prev and next exist
            }
          }));
          
          // Update overall metrics
          setGenerationMetrics(prev => ({
            ...prev,
            currentSection: section.title
          }));

          return {
            ...section,
            content: generatedContent
          };
        } catch (error) {
          console.error(`Error generating content for section ${section.title}:`, error);
          setGeneratingProgress(prev => ({
            ...prev,
            [section.id]: { status: 'error', message: `Failed to generate ${section.title}` }
          }));
          return section;
        }
      };

      // Process sections sequentially to show accurate progress
      const processAllSections = async () => {
        let completedCount = 0;
        const totalCount = sections.length;
        
        // Create a local copy to track all generated content
        const updatedSections = [...sections];
        
        for (let index = 0; index < sections.length; index++) {
          const section = sections[index];
          
          // Update current section being generated
          setCurrentGeneratingSection(section.id);
          setGenerationMetrics(prev => ({
            ...prev,
            currentSection: section.title,
            completedSections: completedCount,
            overallProgress: Math.round((completedCount / totalCount) * 100)
          }));
          
          const updatedSection = await generateForSection(section, index);
          
          // Store the updated section in our local array
          updatedSections[index] = updatedSection;
          
          // Update completed count and progress after each section
          completedCount++;
          setGenerationMetrics(prev => ({
            ...prev,
            completedSections: completedCount,
            overallProgress: Math.round((completedCount / totalCount) * 100)
          }));
          
          // Update sections state after each completion
          setSections(prevSections => {
            const newSections = [...prevSections];
            newSections[index] = updatedSection;
            return newSections;
          });
        }
        
        // Return the actual updated sections with their generated content
        return updatedSections;
        // This ensures we're returning the most up-to-date version of the sections
        // with all the content that was generated during the process
      };
      
      // Get the final updated sections with all generated content
      const updatedSections = await processAllSections();
      
      // Create a reference to the final sections with all generated content
      // This ensures we capture the most up-to-date content from the generation process
      const finalSections = updatedSections.map(section => ({
        ...section,
        // Ensure we're using the most up-to-date content
        content: section.content || ''
      }));
      
      // Update the sections state with the final content
      // This is critical for content persistence
      setSections(finalSections);

      const successfulSections = finalSections.filter(section =>
        generatingProgress[section.id]?.status === 'completed'
      );

      if (successfulSections.length === updatedSections.length) {
        message.success('All sections generated successfully');
      } else if (successfulSections.length > 0) {
        message.warning(`Generated ${successfulSections.length} out of ${updatedSections.length} sections`);
      } else {
        message.error('Failed to generate any sections');
      }
      
      // Update final metrics
      setGenerationMetrics(prev => ({
        ...prev,
        completedSections: successfulSections.length,
        overallProgress: 100
      }));
      
    } catch (error) {
      console.error('Error in handleGenerateAll:', error);
      message.error('Failed to generate content');
    } finally {
      setIsGenerating(false);
      
      // Keep modal open for a moment so user can see final results
      // Ensure all state updates are applied before closing the modal
      setTimeout(() => {
        // Refresh sections one more time before closing modal to ensure content persistence
        // This is critical - it ensures the latest content state is preserved before modal closes
        setSections(prevSections => {
          // Create a deep copy to ensure we're not losing any generated content
          return prevSections.map(s => {
            // If this is the section we just generated content for, make sure to preserve that content
            if (s.id === currentGeneratingSection && s.content) {
              return {
                ...s,
                content: s.content
              };
            }
            return {
              ...s,
              content: s.content || ''
            };
          });
        });
        
        // Only close the modal after ensuring content is preserved
        setTimeout(() => {
          setIsProgressModalVisible(false);
        }, 500);
      }, 3000);
    }
  };

  const calculateUniquenessScore = (content: string, outline: ContentPreviewProps['outline'], currentIndex: number): number => {
    let score = 100;
    const otherContents = outline
      .filter((_, index: number) => index !== currentIndex)
      .map((section: ContentPreviewProps['outline'][0]) => section.content || '')
      .filter(Boolean);

    // Calculate weighted similarity scores based on proximity to current section
    let totalSimilarityImpact = 0;
    for (let i = 0; i < otherContents.length; i++) {
      const otherContent = otherContents[i];
      const similarity = calculateTextSimilarity(content, otherContent);
      
      // Calculate proximity weight - sections closer to current have more impact
      const sectionIndex = i >= currentIndex ? i + 1 : i;
      const distance = Math.abs(sectionIndex - currentIndex);
      const proximityWeight = 1 / (distance + 1); // Sections closer have higher weight
      
      // Apply weighted penalty to score
      const similarityImpact = similarity * 25 * proximityWeight;
      totalSimilarityImpact += similarityImpact;
    }
    
    score -= totalSimilarityImpact;

    return Math.max(0, Math.min(100, score));
  };

  const calculateContextualScore = (content: string, previousContent?: string, nextContent?: string): number => {
    let score = 100;
    
    // Analyze semantic relationship with previous content
    if (previousContent) {
      const prevCoherence = calculateCoherence(content, previousContent);
      const prevThematicConnection = calculateThematicConnection(content, previousContent);
      const prevNarrativeFlow = calculateNarrativeFlow(content, previousContent, 'previous');
      
      // Weight the different aspects of contextual coherence
      const prevScore = (prevCoherence * 0.4) + (prevThematicConnection * 0.4) + (prevNarrativeFlow * 0.2);
      score = previousContent ? (score + prevScore) / 2 : score;
    }
    
    // Analyze semantic relationship with next content
    if (nextContent) {
      const nextCoherence = calculateCoherence(content, nextContent);
      const nextThematicConnection = calculateThematicConnection(content, nextContent);
      const nextNarrativeFlow = calculateNarrativeFlow(content, nextContent, 'next');
      
      // Weight the different aspects of contextual coherence
      const nextScore = (nextCoherence * 0.4) + (nextThematicConnection * 0.4) + (nextNarrativeFlow * 0.2);
      score = nextContent ? (score + nextScore) / 2 : score;
    }

    return Math.max(0, Math.min(100, score));
  };

  const calculateTextSimilarity = (text1: string, text2: string): number => {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return intersection.size / union.size;
  };

  const calculateCoherence = (text1: string, text2: string): number => {
    const keywords1 = extractKeywords(text1);
    const keywords2 = extractKeywords(text2);
    const commonKeywords = keywords1.filter(k => keywords2.includes(k));
    return (commonKeywords.length / Math.max(keywords1.length, keywords2.length)) * 100;
  };

  const calculateThematicConnection = (text1: string, text2: string): number => {
    // Extract semantic themes from both texts
    const themes1 = extractThemes(text1);
    const themes2 = extractThemes(text2);
    
    // Calculate thematic overlap
    const commonThemes = themes1.filter(theme => 
      themes2.some(t2 => calculateSimilarity(theme, t2) > 0.7)
    );
    
    // Calculate thematic connection score
    const thematicScore = (commonThemes.length / Math.max(themes1.length, themes2.length)) * 100;
    return thematicScore;
  };

  const calculateNarrativeFlow = (text1: string, text2: string, direction: 'previous' | 'next'): number => {
    // Check for transitional phrases that indicate good flow
    const transitionScore = checkTransitionalPhrases(text1, text2, direction);
    
    // Check for logical progression of ideas
    const progressionScore = checkLogicalProgression(text1, text2, direction);
    
    // Combine scores with appropriate weights
    return (transitionScore * 0.6) + (progressionScore * 0.4);
  };

  const extractKeywords = (text: string): string[] => {
    return text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['and', 'the', 'this', 'that', 'with', 'from', 'have', 'been', 'were', 'they', 'their', 'what', 'when', 'where', 'which', 'would', 'could', 'should', 'about'].includes(word));
  };

  const extractThemes = (text: string): string[] => {
    // Extract potential thematic phrases (2-3 word combinations)
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = ['and', 'the', 'this', 'that', 'with', 'from', 'have', 'been', 'were', 'they', 'their'];
    const filteredWords = words.filter(word => word.length > 3 && !stopWords.includes(word));
    
    // Create n-grams for thematic analysis
    const themes: string[] = [];
    for (let i = 0; i < filteredWords.length - 1; i++) {
      themes.push(`${filteredWords[i]} ${filteredWords[i + 1]}`);
      if (i < filteredWords.length - 2) {
        themes.push(`${filteredWords[i]} ${filteredWords[i + 1]} ${filteredWords[i + 2]}`);
      }
    }
    
    // Count occurrences and return top themes
    const themeCounts = themes.reduce((acc, theme) => {
      acc[theme] = (acc[theme] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(themeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([theme]) => theme);
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const set1 = new Set(str1.split(' '));
    const set2 = new Set(str2.split(' '));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  };

  const checkTransitionalPhrases = (text1: string, text2: string, direction: 'previous' | 'next'): number => {
    const forwardTransitions = [
      'therefore', 'thus', 'consequently', 'as a result', 'hence', 'accordingly',
      'next', 'then', 'subsequently', 'following this', 'afterward', 'later',
      'furthermore', 'moreover', 'in addition', 'additionally', 'also', 'besides',
      'similarly', 'likewise', 'in the same way', 'comparatively'
    ];
    
    const backwardTransitions = [
      'previously', 'as mentioned earlier', 'as discussed above', 'referring back to',
      'in light of', 'given the above', 'with this in mind', 'considering this',
      'building on this', 'expanding on this'
    ];
    
    const transitions = direction === 'next' ? forwardTransitions : backwardTransitions;
    const textToCheck = direction === 'next' ? text2 : text1;
    
    let transitionCount = 0;
    for (const phrase of transitions) {
      if (textToCheck.toLowerCase().includes(phrase)) {
        transitionCount++;
      }
    }
    
    // Calculate score based on presence of transitional phrases
    return Math.min(100, transitionCount * 20);
  };

  const checkLogicalProgression = (text1: string, text2: string, direction: 'previous' | 'next'): number => {
    // Check if concepts introduced in the first text are expanded in the second
    const keywords1 = extractKeywords(text1);
    const keywords2 = extractKeywords(text2);
    
    // For forward progression, check if keywords from text1 appear in text2
    // For backward reference, check if keywords from text2 appear in text1
    const sourceKeywords = direction === 'next' ? keywords1 : keywords2;
    const targetKeywords = direction === 'next' ? keywords2 : keywords1;
    
    const referencedKeywords = sourceKeywords.filter(k => targetKeywords.includes(k));
    const progressionScore = (referencedKeywords.length / sourceKeywords.length) * 100;
    
    return Math.min(100, progressionScore);
  };

  const handleGenerate = async (section: typeof outline[0]) => {
    if (!onGenerateContent) return;

    setIsGenerating(true);
    setEditingSectionId(section.id);
    setCurrentGeneratingSection(section.id);
    
    // Initialize generation metrics for single section
    setGenerationMetrics({
      totalSections: 1,
      completedSections: 0,
      currentSection: section.title,
      overallProgress: 0
    });
    
    setGeneratingProgress(prev => ({
      ...prev,
      [section.id]: { status: 'generating', message: `Generating ${section.title}...` }
    }));
    
    // Show progress modal
    setIsProgressModalVisible(true);

    try {
      const sectionIndex = sections.findIndex(s => s.id === section.id);
      const previousContent = sectionIndex > 0 ? sections[sectionIndex - 1].content : undefined;
      const nextContent = sectionIndex < sections.length - 1 ? sections[sectionIndex + 1].content : undefined;
      
      const generatedContent = await onGenerateContent(section.id, {
        title: section.title,
        keywords: section.keywords,
        type: section.sectionType,
        previousContent,
        nextContent,
        globalContext: {
          title: sections[0].title,
          outline: sections.map(s => ({ title: s.title, keywords: s.keywords }))
        }
      });
      
      // Update the sections state with the new content
      setSections(prevSections => 
        prevSections.map(s => 
          s.id === section.id ? { ...s, content: generatedContent } : s
        )
      );
      
      // Calculate all metrics
      const uniquenessScore = calculateUniquenessScore(generatedContent, sections, sectionIndex);
      const contextualScore = calculateContextualScore(generatedContent, previousContent, nextContent);
      const coherenceScore = calculateCoherence(generatedContent, previousContent || nextContent || '');
      const thematicScore = calculateThematicConnection(generatedContent, previousContent || nextContent || '');
      const narrativeFlowScore = calculateNarrativeFlow(generatedContent, previousContent || '', 'previous') + 
                               (nextContent ? calculateNarrativeFlow(generatedContent, nextContent, 'next') : 0);
      
      setEditingContent(generatedContent);
      setIsEditing(true);
      
      // Update progress with all metrics
      setGeneratingProgress(prev => ({
        ...prev,
        [section.id]: { 
          status: 'completed', 
          message: `${section.title} completed`,
          uniquenessScore,
          contextualScore,
          coherenceScore,
          thematicScore,
          narrativeFlowScore: narrativeFlowScore / (nextContent ? 2 : 1) // Average if both prev and next exist
        }
      }));
      
      // Update overall metrics
      setGenerationMetrics(prev => ({
        ...prev,
        completedSections: 1,
        overallProgress: 100
      }));
      
      if (onContentUpdate) {
        await onContentUpdate(section.id, generatedContent);
      }
    } catch (error) {
      console.error(`Error generating content for section ${section.title}:`, error);
      message.error('Failed to generate content');
      setGeneratingProgress(prev => ({
        ...prev,
        [section.id]: { status: 'error', message: `Failed to generate ${section.title}` }
      }));
    } finally {
      setIsGenerating(false);
      
      // Keep modal open for a moment so user can see final results
      // Ensure all state updates are applied before closing the modal
      setTimeout(() => {
        // Refresh sections one more time before closing modal to ensure content persistence
        // This is critical - it ensures the latest content state is preserved before modal closes
        setSections(prevSections => {
          // Create a deep copy to ensure we're not losing any generated content
          return prevSections.map(s => {
            // If this is the section we just generated content for, make sure to preserve that content
            if (s.id === currentGeneratingSection && s.content) {
              return {
                ...s,
                content: s.content
              };
            }
            return {
              ...s,
              content: s.content || ''
            };
          });
        });
        
        // Only close the modal after ensuring content is preserved
        setTimeout(() => {
          setIsProgressModalVisible(false);
        }, 500);
      }, 3000);
    }
  };

  return (
    <div className="content-preview">
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>Content Preview</span>
          </Space>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<RobotOutlined />}
              onClick={handleGenerateAll}
              loading={isGenerating}
              disabled={isEditing}
            >
              Generate All Sections
            </Button>
            <Button
              icon={<LineChartOutlined />}
              onClick={() => {
                // In a real implementation, this would navigate to the ContentQualityAssessment page
                // with the current content as a parameter
                window.location.href = '/content-quality';
              }}
              disabled={isGenerating || sections.some(s => !s.content)}
            >
              Analyze Content Quality
            </Button>
            <Divider type="vertical" />
            <ClockCircleOutlined />
            <Text>{estimatedReadingTime} min read</Text>
            <Divider type="vertical" />
            <Progress
              type="circle"
              percent={averageScore}
              size="small"
              status={averageScore >= 70 ? 'success' : 'normal'}
            />
          </Space>
        }
      >
        <div className="preview-content space-y-6">
          {sections.map((section, index) => {
            const progress = generatingProgress[section.id];
            const isLastSection = index === sections.length - 1;
            const sectionLevel = section.sectionType === 'introduction' ? 1 : 
                               section.sectionType === 'conclusion' ? 1 : 
                               section.sectionType === 'body' ? 2 : 3;

            return (
              <div key={section.id} className="preview-section relative">
                <div className={`section-container p-4 rounded-lg border-l-4 ${getSectionBorderColor(section.sectionType)}`}>
                  <Title
                    level={sectionLevel}
                    style={{
                      marginBottom: '16px',
                      paddingLeft: `${(sectionLevel - 1) * 20}px`
                    }}
                    className="flex items-center gap-2"
                  >
                    <span className="section-type-indicator">{getSectionTypeIcon(section.sectionType)}</span>
                    {section.title}
                    {progress?.status === 'generating' && (
                      <Tag color="processing" icon={<LoadingOutlined />} style={{ marginLeft: '8px' }}>
                        Generating...
                      </Tag>
                    )}
                  </Title>

                  <div className="section-content pl-4 border-l border-gray-200">
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      <div className="flex flex-wrap gap-2">
                        {section.keywords.map((keyword, idx) => (
                          <Tag key={idx} color="blue">{keyword}</Tag>
                        ))}
                      </div>

                      <TextArea
                        value={sections.find(s => s.id === section.id)?.content || ''}
                        placeholder="No content generated yet"
                        className="content-text"
                        style={{ marginBottom: '16px' }}
                        rows={6}
                        readOnly={!editingSectionId || editingSectionId !== section.id}
                        onChange={(e) => {
                          if (editingSectionId === section.id) {
                            const newContent = e.target.value;
                            setEditingContent(newContent);
                            // Update the sections state immediately to ensure content persistence
                            setSections(prevSections => {
                              const updatedSections = [...prevSections];
                              const sectionIndex = updatedSections.findIndex(s => s.id === section.id);
                              if (sectionIndex !== -1) {
                                updatedSections[sectionIndex] = {
                                  ...updatedSections[sectionIndex],
                                  content: newContent
                                };
                              }
                              return updatedSections;
                            });
                            
                            // If we have an onContentUpdate callback, we should call it to ensure
                            // parent components are aware of the content change
                            if (onContentUpdate) {
                              // We don't need to await this as it's not critical for UI updates
                              onContentUpdate(section.id, newContent).catch(err => 
                                console.error('Error updating content in parent:', err)
                              );
                            }
                          }
                        }}
                      />

                      {/* Display semantic relationship metrics */}
                      {(progress?.uniquenessScore !== undefined || progress?.contextualScore !== undefined || sections[index].content) && (
                        <div className="mb-4 space-y-2">
                          {progress?.uniquenessScore !== undefined && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">Uniqueness:</span>
                              <Progress 
                                percent={progress.uniquenessScore} 
                                size="small" 
                                status={progress.uniquenessScore >= 70 ? 'success' : 'normal'}
                                format={percent => `${percent}%`}
                              />
                              <Tooltip title="How unique this section is compared to others">
                                <QuestionCircleOutlined className="text-gray-400" />
                              </Tooltip>
                            </div>
                          )}
                          {progress?.contextualScore !== undefined && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">Contextual Flow:</span>
                              <Progress 
                                percent={progress.contextualScore} 
                                size="small" 
                                status={progress.contextualScore >= 70 ? 'success' : 'normal'}
                                format={percent => `${percent}%`}
                              />
                              <Tooltip title="How well this section connects with adjacent sections">
                                <QuestionCircleOutlined className="text-gray-400" />
                              </Tooltip>
                            </div>
                          )}
                          
                          {/* Semantic relationship visualization */}
                          {index > 0 && sections[index].content && sections[index-1].content && (
                            <div className="semantic-relationship mt-2 p-2 bg-gray-50 rounded-md">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-xs text-gray-500">Thematic Connection:</span>
                                {(() => {
                                  const currentContent = sections[index].content || '';
                                  const prevContent = sections[index-1].content || '';
                                  const thematicScore = calculateThematicConnection(currentContent, prevContent);
                                  return (
                                    <Tooltip title={`${Math.round(thematicScore)}% thematic overlap with previous section`}>
                                      <div className="flex">
                                        {[1, 2, 3, 4, 5].map(i => (
                                          <div 
                                            key={i}
                                            className={`h-2 w-2 rounded-full mx-0.5 ${thematicScore >= i * 20 ? 'bg-blue-500' : 'bg-gray-200'}`}
                                          />
                                        ))}
                                      </div>
                                    </Tooltip>
                                  );
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      <Space>
                        <Button
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(section)}
                          disabled={isGenerating}
                        >
                          Edit
                        </Button>
                        <Button
                          icon={<RobotOutlined />}
                          onClick={() => handleGenerate(section)}
                          loading={progress?.status === 'generating'}
                          disabled={isEditing}
                        >
                          Generate Section
                        </Button>
                      </Space>
                    </Space>
                  </div>
                </div>

                {!isLastSection && (
                  <div className="flow-indicator flex flex-col items-center my-2">
                    {/* Flow quality indicator */}
                    {sections[index].content && sections[index + 1].content && (
                      <div className="flow-quality-indicator mb-1">
                        {(() => {
                          const currentContent = sections[index].content || '';
                          const nextContent = sections[index + 1].content || '';
                          if (currentContent && nextContent) {
                            const flowScore = calculateContextualScore(currentContent, undefined, nextContent);
                            let flowColor = 'text-red-500';
                            let flowWidth = 'w-1';
                            
                            if (flowScore >= 80) {
                              flowColor = 'text-green-500';
                              flowWidth = 'w-3';
                            } else if (flowScore >= 60) {
                              flowColor = 'text-blue-500';
                              flowWidth = 'w-2';
                            } else if (flowScore >= 40) {
                              flowColor = 'text-yellow-500';
                              flowWidth = 'w-1.5';
                            }
                            
                            return (
                              <Tooltip title={`Flow score: ${Math.round(flowScore)}% - ${getFlowDescription(flowScore)}`}>
                                <div className={`flow-line h-8 ${flowWidth} ${flowColor} rounded-full`}></div>
                              </Tooltip>
                            );
                          }
                          return <div className="flow-line h-8 w-1 text-gray-300 rounded-full"></div>;
                        })()} 
                      </div>
                    )}
                    <ArrowDownOutlined className="text-gray-400 text-lg" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Modal
        title="Edit Section Content"
        open={isEditing}
        onOk={handleSave}
        onCancel={() => {
          setIsEditing(false);
          setEditingSectionId(null);
        }}
        width={800}
      >
        <TextArea
          value={editingContent}
          onChange={(e) => setEditingContent(e.target.value)}
          rows={15}
          style={{ marginTop: '16px' }}
        />
      </Modal>

      {/* Progress Modal */}
      <Modal
        title={
          <div className="flex items-center justify-between">
            <span>Generating Content</span>
            <Progress 
              type="circle" 
              percent={generationMetrics.overallProgress} 
              size="small" 
              status={isGenerating ? 'active' : 'success'}
            />
          </div>
        }
        open={isProgressModalVisible}
        footer={null}
        closable={!isGenerating}
        onCancel={() => setIsProgressModalVisible(false)}
        width={700}
      >
        <div className="progress-content space-y-4">
          <div className="overall-progress">
            <div className="flex justify-between mb-1">
              <span>Overall Progress</span>
              <span>{generationMetrics.completedSections} of {generationMetrics.totalSections} sections</span>
            </div>
            <Progress 
              percent={Math.round((generationMetrics.completedSections / Math.max(1, generationMetrics.totalSections)) * 100)} 
              status={isGenerating ? 'active' : 'success'}
            />
          </div>

          <div className="current-section mt-4">
            <div className="flex items-center mb-2">
              <LoadingOutlined style={{ marginRight: '8px' }} spin={isGenerating} />
              <span className="font-medium">
                {isGenerating ? `Generating: ${generationMetrics.currentSection}` : 'Generation Complete'}
              </span>
            </div>

            {currentGeneratingSection && generatingProgress[currentGeneratingSection] && (
              <div className="metrics-container p-4 bg-gray-50 rounded-lg space-y-3">
                <h4 className="text-sm font-medium">Content Quality Metrics</h4>
                
                {generatingProgress[currentGeneratingSection].uniquenessScore !== undefined && (
                  <div className="metric-item">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm flex items-center">
                        Uniqueness Score
                        <Tooltip title="Measures how distinct this content is from other sections. Higher scores indicate more original content with less repetition.">
                          <QuestionCircleOutlined className="ml-1 text-gray-400" />
                        </Tooltip>
                      </span>
                      <span className="text-sm font-medium">
                        {Math.round(generatingProgress[currentGeneratingSection].uniquenessScore || 0)}%
                      </span>
                    </div>
                    <Progress 
                      percent={generatingProgress[currentGeneratingSection].uniquenessScore} 
                      size="small"
                      status={getProgressStatus(generatingProgress[currentGeneratingSection].uniquenessScore || 0)}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      How unique this content is compared to other sections
                    </div>
                  </div>
                )}

                {generatingProgress[currentGeneratingSection].contextualScore !== undefined && (
                  <div className="metric-item">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm flex items-center">
                        Contextual Flow
                        <Tooltip title="Evaluates how well this section connects with adjacent sections. Higher scores indicate smoother transitions and better narrative continuity.">
                          <QuestionCircleOutlined className="ml-1 text-gray-400" />
                        </Tooltip>
                      </span>
                      <span className="text-sm font-medium">
                        {Math.round(generatingProgress[currentGeneratingSection].contextualScore || 0)}%
                      </span>
                    </div>
                    <Progress 
                      percent={generatingProgress[currentGeneratingSection].contextualScore} 
                      size="small"
                      status={getProgressStatus(generatingProgress[currentGeneratingSection].contextualScore || 0)}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      How well this content connects with adjacent sections
                    </div>
                  </div>
                )}

                {generatingProgress[currentGeneratingSection].coherenceScore !== undefined && (
                  <div className="metric-item">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm flex items-center">
                        Coherence
                        <Tooltip title="Measures the internal logical consistency of the content. Higher scores indicate well-structured content with clear logical connections between ideas.">
                          <QuestionCircleOutlined className="ml-1 text-gray-400" />
                        </Tooltip>
                      </span>
                      <span className="text-sm font-medium">
                        {Math.round(generatingProgress[currentGeneratingSection].coherenceScore || 0)}%
                      </span>
                    </div>
                    <Progress 
                      percent={generatingProgress[currentGeneratingSection].coherenceScore} 
                      size="small"
                      status={getProgressStatus(generatingProgress[currentGeneratingSection].coherenceScore || 0)}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Internal logical consistency of the content
                    </div>
                  </div>
                )}

                {generatingProgress[currentGeneratingSection].thematicScore !== undefined && (
                  <div className="metric-item">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm flex items-center">
                        Thematic Connection
                        <Tooltip title="Evaluates how well the content maintains key themes and concepts throughout. Higher scores indicate stronger thematic consistency and better alignment with the overall topic.">
                          <QuestionCircleOutlined className="ml-1 text-gray-400" />
                        </Tooltip>
                      </span>
                      <span className="text-sm font-medium">
                        {Math.round(generatingProgress[currentGeneratingSection].thematicScore || 0)}%
                      </span>
                    </div>
                    <Progress 
                      percent={generatingProgress[currentGeneratingSection].thematicScore} 
                      size="small"
                      status={getProgressStatus(generatingProgress[currentGeneratingSection].thematicScore || 0)}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      How well the content maintains key themes and concepts
                    </div>
                  </div>
                )}

                {generatingProgress[currentGeneratingSection].narrativeFlowScore !== undefined && (
                  <div className="metric-item">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm flex items-center">
                        Narrative Flow
                        <Tooltip title="Measures how smoothly the content transitions between ideas. Higher scores indicate a more engaging and readable narrative with natural progression of thoughts.">
                          <QuestionCircleOutlined className="ml-1 text-gray-400" />
                        </Tooltip>
                      </span>
                      <span className="text-sm font-medium">
                        {Math.round(generatingProgress[currentGeneratingSection].narrativeFlowScore || 0)}%
                      </span>
                    </div>
                    <Progress 
                      percent={generatingProgress[currentGeneratingSection].narrativeFlowScore} 
                      size="small"
                      status={getProgressStatus(generatingProgress[currentGeneratingSection].narrativeFlowScore || 0)}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      How smoothly the content transitions between ideas
                    </div>
                  </div>
                )}
                
                <div className="algorithm-info mt-4 text-xs text-gray-500">
                  <p>Our AI is analyzing content using multiple dimensions of quality assessment including semantic coherence, thematic consistency, and narrative flow.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

function getSectionBorderColor(sectionType: string): string {
  switch (sectionType) {
    case 'introduction':
      return 'border-blue-500';
    case 'conclusion':
      return 'border-green-500';
    case 'body':
      return 'border-purple-500';
    case 'faq':
      return 'border-orange-500';
    case 'case_study':
      return 'border-yellow-500';
    default:
      return 'border-gray-500';
  }
}

function getSectionTypeIcon(sectionType: string) {
  switch (sectionType) {
    case 'introduction':
      return '📝';
    case 'conclusion':
      return '🎯';
    case 'body':
      return '📄';
    case 'faq':
      return '❓';
    case 'case_study':
      return '📊';
    default:
      return '📑';
  }
}

function getFlowDescription(score: number): string {
  if (score >= 90) {
    return 'Excellent flow with strong thematic connections';
  } else if (score >= 80) {
    return 'Very good narrative progression';
  } else if (score >= 70) {
    return 'Good contextual coherence';
  } else if (score >= 60) {
    return 'Adequate transition between sections';
  } else if (score >= 50) {
    return 'Basic thematic connection';
  } else if (score >= 40) {
    return 'Weak transition - consider improving';
  } else if (score >= 30) {
    return 'Poor flow - sections seem disconnected';
  } else {
    return 'Very poor coherence - needs significant revision';
  }
}

function getProgressStatus(score: number): 'success' | 'normal' | 'exception' | 'active' {
  if (score >= 80) {
    return 'success';
  } else if (score >= 60) {
    return 'normal';
  } else if (score >= 40) {
    return 'active';
  } else {
    return 'exception';
  }
}