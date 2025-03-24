'use client';

import { useState, useEffect } from 'react';
import { Form, Select, Slider, Button, Typography, Card, Tooltip, Divider, Input, Tag } from 'antd';
import { InfoCircleOutlined, UserOutlined, SoundOutlined, GlobalOutlined, AimOutlined, BookOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

export type ContentPersonalizationPreferences = {
  contentTone: string;
  writingStyle: string;
  targetAudience: string;
  industryTerminology: string;
  contentComplexity: number;
  keyTerms: string[];
  contentLength: 'concise' | 'balanced' | 'comprehensive';
};

type ContentPersonalizationFormProps = {
  onPreferencesChange: (preferences: ContentPersonalizationPreferences) => void;
  initialPreferences?: Partial<ContentPersonalizationPreferences>;
  onSave?: (preferences: ContentPersonalizationPreferences) => void;
};

const defaultPreferences: ContentPersonalizationPreferences = {
  contentTone: 'professional',
  writingStyle: 'informative',
  targetAudience: 'general',
  industryTerminology: 'general',
  contentComplexity: 50,
  keyTerms: [],
  contentLength: 'balanced'
};

export default function ContentPersonalizationForm({
  onPreferencesChange,
  initialPreferences,
  onSave
}: ContentPersonalizationFormProps) {
  const [form] = Form.useForm();
  const [preferences, setPreferences] = useState<ContentPersonalizationPreferences>({
    ...defaultPreferences,
    ...initialPreferences
  });
  const [keyTermInput, setKeyTermInput] = useState('');

  useEffect(() => {
    if (preferences) {
      form.setFieldsValue(preferences);
    }
  }, [preferences, form]);

  const handleValuesChange = (changedValues: Record<string, unknown>, allValues: ContentPersonalizationPreferences) => {
    const updatedPreferences = {
      ...preferences,
      ...allValues,
    };
    setPreferences(updatedPreferences);
    onPreferencesChange(updatedPreferences);
  };

  const handleAddKeyTerm = () => {
    if (keyTermInput && !preferences.keyTerms.includes(keyTermInput)) {
      const updatedKeyTerms = [...preferences.keyTerms, keyTermInput];
      const updatedPreferences = {
        ...preferences,
        keyTerms: updatedKeyTerms
      };
      setPreferences(updatedPreferences);
      form.setFieldsValue({ keyTerms: updatedKeyTerms });
      onPreferencesChange(updatedPreferences);
      setKeyTermInput('');
    }
  };

  const handleRemoveKeyTerm = (term: string) => {
    const updatedKeyTerms = preferences.keyTerms.filter(t => t !== term);
    const updatedPreferences = {
      ...preferences,
      keyTerms: updatedKeyTerms
    };
    setPreferences(updatedPreferences);
    form.setFieldsValue({ keyTerms: updatedKeyTerms });
    onPreferencesChange(updatedPreferences);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(preferences);
    }
  };

  return (
    <Card className="shadow-md">
      <Title level={4}>Content Personalization Preferences</Title>
      <Text type="secondary" className="mb-4 block">
        Customize how your content is generated to match your brand voice and audience needs.
      </Text>
      
      <Form
        form={form}
        layout="vertical"
        initialValues={preferences}
        onValuesChange={handleValuesChange}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="contentTone"
            label={
              <span className="flex items-center">
                <SoundOutlined className="mr-2" />
                Content Tone
                <Tooltip title="The emotional quality or attitude of your content">
                  <InfoCircleOutlined className="ml-2 text-gray-400" />
                </Tooltip>
              </span>
            }
          >
            <Select>
              <Option value="professional">Professional</Option>
              <Option value="conversational">Conversational</Option>
              <Option value="friendly">Friendly</Option>
              <Option value="authoritative">Authoritative</Option>
              <Option value="enthusiastic">Enthusiastic</Option>
              <Option value="technical">Technical</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="writingStyle"
            label={
              <span className="flex items-center">
                <BookOutlined className="mr-2" />
                Writing Style
                <Tooltip title="The approach and structure of your content">
                  <InfoCircleOutlined className="ml-2 text-gray-400" />
                </Tooltip>
              </span>
            }
          >
            <Select>
              <Option value="informative">Informative</Option>
              <Option value="narrative">Narrative</Option>
              <Option value="persuasive">Persuasive</Option>
              <Option value="descriptive">Descriptive</Option>
              <Option value="analytical">Analytical</Option>
              <Option value="instructional">Instructional</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="targetAudience"
            label={
              <span className="flex items-center">
                <UserOutlined className="mr-2" />
                Target Audience
                <Tooltip title="The primary readers or users of your content">
                  <InfoCircleOutlined className="ml-2 text-gray-400" />
                </Tooltip>
              </span>
            }
          >
            <Select>
              <Option value="general">General</Option>
              <Option value="beginners">Beginners</Option>
              <Option value="intermediate">Intermediate</Option>
              <Option value="experts">Experts</Option>
              <Option value="executives">Executives</Option>
              <Option value="technical">Technical Professionals</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="industryTerminology"
            label={
              <span className="flex items-center">
                <GlobalOutlined className="mr-2" />
                Industry Terminology
                <Tooltip title="Specialized vocabulary for your industry">
                  <InfoCircleOutlined className="ml-2 text-gray-400" />
                </Tooltip>
              </span>
            }
          >
            <Select>
              <Option value="general">General</Option>
              <Option value="technology">Technology</Option>
              <Option value="healthcare">Healthcare</Option>
              <Option value="finance">Finance</Option>
              <Option value="marketing">Marketing</Option>
              <Option value="education">Education</Option>
              <Option value="legal">Legal</Option>
              <Option value="ecommerce">E-commerce</Option>
            </Select>
          </Form.Item>
        </div>

        <Divider orientation="left">Advanced Options</Divider>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="contentComplexity"
            label={
              <span className="flex items-center">
                <AimOutlined className="mr-2" />
                Content Complexity
                <Tooltip title="How complex or simple the content should be">
                  <InfoCircleOutlined className="ml-2 text-gray-400" />
                </Tooltip>
              </span>
            }
          >
            <Slider
              marks={{
                0: 'Simple',
                50: 'Balanced',
                100: 'Complex'
              }}
              step={10}
            />
          </Form.Item>

          <Form.Item
            name="contentLength"
            label={
              <span className="flex items-center">
                <BookOutlined className="mr-2" />
                Content Length
                <Tooltip title="Preferred length and detail level of content">
                  <InfoCircleOutlined className="ml-2 text-gray-400" />
                </Tooltip>
              </span>
            }
          >
            <Select>
              <Option value="concise">Concise</Option>
              <Option value="balanced">Balanced</Option>
              <Option value="comprehensive">Comprehensive</Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          label={
            <span className="flex items-center">
              Key Terms to Include
              <Tooltip title="Specific terms or phrases to emphasize in the content">
                <InfoCircleOutlined className="ml-2 text-gray-400" />
              </Tooltip>
            </span>
          }
        >
          <div className="flex flex-wrap gap-2 mb-2">
            {preferences.keyTerms.map(term => (
              <Tag
                key={term}
                closable
                onClose={() => handleRemoveKeyTerm(term)}
              >
                {term}
              </Tag>
            ))}
          </div>
          <div className="flex">
            <Input
              value={keyTermInput}
              onChange={e => setKeyTermInput(e.target.value)}
              onPressEnter={handleAddKeyTerm}
              placeholder="Add key term"
            />
            <Button type="primary" onClick={handleAddKeyTerm} className="ml-2">
              Add
            </Button>
          </div>
        </Form.Item>

        {onSave && (
          <div className="flex justify-end mt-4">
            <Button type="primary" onClick={handleSave}>
              Save Preferences
            </Button>
          </div>
        )}
      </Form>
    </Card>
  );
}