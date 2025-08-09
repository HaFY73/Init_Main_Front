'use client';

import {useState, useCallback} from 'react';
import {motion} from 'framer-motion';
import {useInView} from 'react-intersection-observer';
import {PenTool} from 'lucide-react';
import styles from './style.module.css';
import QuestionBlock from './components/QuestionBlock';
import Sidebar from './components/Sidebar';
import SavePanel from './components/SavePanel';
import {CoverLetterResponse} from '@/lib/api';
import {useAuth} from '@/hooks/useAuth';
import GlobalSidebar from "@/components/GlobalSidebar/GlobalSidebar";

interface Question {
    id: string;
    title: string;
    content: string;
}

export default function IntroducePage() {
    const {userId, userName, isLoading} = useAuth();

    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState<Question[]>([
        {id: '1', title: '', content: ''},
    ]);
    const [showQuestionHeaders, setShowQuestionHeaders] = useState(false);
    const [currentCoverLetterId, setCurrentCoverLetterId] = useState<number | undefined>();

    const {ref, inView} = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const addQuestion = useCallback(() => {
        const newId = (questions.length + 1).toString();
        setQuestions(prev => [...prev, {id: newId, title: '', content: ''}]);

        setTimeout(() => {
            const element = document.getElementById(`question-${questions.length + 1}`);
            element?.scrollIntoView({behavior: 'smooth', block: 'center'});
        }, 100);
    }, [questions.length]);

    const removeLastQuestion = useCallback(() => {
        if (questions.length > 1) {
            setQuestions(prev => prev.slice(0, -1));

            setTimeout(() => {
                const element = document.getElementById(`question-${questions.length - 1}`);
                element?.scrollIntoView({behavior: 'smooth', block: 'center'});
            }, 100);
        }
    }, [questions.length]);

    const updateQuestion = useCallback((id: string, field: 'title' | 'content', value: string) => {
        setQuestions(prev =>
            prev.map(q => (q.id === id ? {...q, [field]: value} : q))
        );
    }, []);

    const scrollToQuestion = useCallback((index: number) => {
        const element = document.getElementById(`question-${index}`);
        element?.scrollIntoView({behavior: 'smooth', block: 'center'});
    }, []);

    const handleToggleChange = useCallback((checked: boolean) => {
        if (!checked && questions.length > 1) {
            // 토글을 끄려고 할 때는 그냥 끄기 (다중 문항 모드 - 1000자)
            setShowQuestionHeaders(false);
            
            // 각 문항의 내용이 1000자를 초과하는지 확인하고 잘라내기
            const hasOverflow = questions.some(q => q.content.length > 1000);
            setQuestions(prev => prev.map(q => ({
                ...q,
                content: q.content.length > 1000 ? q.content.substring(0, 1000) : q.content
            })));
            
            // 글자수가 잘렸다면 사용자에게 알림
            if (hasOverflow) {
                alert('다중 문항 모드로 변경되면서 1,000자를 초과하는 내용이 자동으로 잘렸습니다.');
            }
        } else if (checked && questions.length > 1) {
            // 토글을 켜려고 할 때 (단일 문항으로 변경) 경고
            const confirmed = window.confirm(
                '단일 질문 모드로 변경하면 첫 번째 문항만 남고 나머지 문항들은 삭제됩니다.\n\n정말로 계속하시겠습니까?'
            );

            if (confirmed) {
                // 첫 번째 문항의 내용이 2000자를 초과하는지 확인
                const firstQuestion = questions[0];
                const wasOverflow = firstQuestion.content.length > 2000;
                const truncatedContent = firstQuestion.content.length > 2000 
                    ? firstQuestion.content.substring(0, 2000) 
                    : firstQuestion.content;
                
                setQuestions([{
                    ...firstQuestion,
                    content: truncatedContent
                }]);
                setShowQuestionHeaders(true);
                
                // 글자수가 잘렸다면 사용자에게 알림
                if (wasOverflow) {
                    alert('단일 문항 모드로 변경되면서 2,000자를 초과하는 내용이 자동으로 잘렸습니다.');
                }
            }
            // confirmed가 false면 토글 상태 변경 안됨 (현재 상태 유지)
        } else {
            // 단일 문항에서 토글 변경
            if (checked) {
                // 단일 문항 모드 (2000자)
                setShowQuestionHeaders(true);
            } else {
                // 다중 문항 모드 (1000자)
                setShowQuestionHeaders(false);
                
                // 내용이 1000자를 초과하면 잘라내기
                const wasOverflow = questions.some(q => q.content.length > 1000);
                setQuestions(prev => prev.map(q => ({
                    ...q,
                    content: q.content.length > 1000 ? q.content.substring(0, 1000) : q.content
                })));
                
                // 글자수가 잘렸다면 사용자에게 알림
                if (wasOverflow) {
                    alert('다중 문항 모드로 변경되면서 1,000자를 초과하는 내용이 자동으로 잘렸습니다.');
                }
            }
        }
    }, [questions]);

    const handleLoadCoverLetter = useCallback((coverLetter: CoverLetterResponse) => {
        setTitle(coverLetter.title);
        setCurrentCoverLetterId(coverLetter.id);

        const loadedQuestions = coverLetter.questions.map((q, index) => ({
            id: (index + 1).toString(),
            title: q.title || '',
            content: q.content || '',
        }));

        if (loadedQuestions.length === 0) {
            loadedQuestions.push({id: '1', title: '', content: ''});
        }

        setQuestions(loadedQuestions);

        // 불러온 자소서의 문항 개수에 따라 토글 상태 설정
        setShowQuestionHeaders(loadedQuestions.length === 1);  // 단일 문항이면 토글 ON
    }, []);

    const resetForm = useCallback(() => {
        setTitle('');
        setQuestions([{id: '1', title: '', content: ''}]);
        setCurrentCoverLetterId(undefined);
    }, []);

    if (isLoading) {
        return <div>로딩 중...</div>;
    }

    if (!userId) {
        return null; // useAuth 훅에서 로그인 페이지로 리다이렉트 처리
    }

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            <GlobalSidebar />
            <main className="flex-1 ml-0 md:ml-64 transition-all duration-300 ease-in-out relative">
                {/* overflow-x-hidden 제거하여 sticky positioning이 정상 작동하도록 함 */}
                <div className={styles.pageContainer}>
                    <motion.div
                        ref={ref}
                        initial={{opacity: 0, y: 20}}
                        animate={inView ? {opacity: 1, y: 0} : {}}
                        transition={{duration: 0.5}}
                        className={styles.pageHeaderInline}
                    >
                        <div className={styles.pageTitleSection}>
                            <h1 className={styles.pageTitle}>
                                <PenTool className={styles.titleIcon}/>
                                자소서 작성
                            </h1>
                            <p className={styles.pageDescription}>
                                나만의 특별한 자기소개서를 작성해보세요
                            </p>
                        </div>
                    </motion.div>

                    <div className={styles.resumePage}>
                        <div className={styles.mainWrapper}>
                            <div className={styles.mainLayout}>
                                <Sidebar
                                    questionCount={questions.length}
                                    onAddQuestion={addQuestion}
                                    onRemoveQuestion={removeLastQuestion}
                                    onScrollToQuestion={scrollToQuestion}
                                    visible={!showQuestionHeaders}
                                />

                                <div className={styles.resume}>
                                    <input
                                        type="text"
                                        className={styles.titleInput}
                                        placeholder="자기소개서 제목을 입력하세요"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />

                                    <div className={styles.toggleContainer}>
                                        <label className={styles.toggleLabel}>
                                            <input
                                                type="checkbox"
                                                checked={showQuestionHeaders}
                                                onChange={(e) => handleToggleChange(e.target.checked)}
                                            />
                                            <span className={styles.toggleSlider}></span>
                                        </label>
                                        <span className={styles.toggleText} title="OFF: 문항별 제목 작성 가능 (1,000자) / ON: 단일 질문 내용만 작성 (2,000자)">
                          ⓘ  "OFF: 문항별 제목 작성 가능 (1,000자) / ON: 단일 질문 내용만 작성 (2,000자)"
                        </span>
                                    </div>

                                    <div className={styles.questionContainer}>
                                        {questions.map((question, index) => (
                                            <QuestionBlock
                                                key={question.id}
                                                id={question.id}
                                                index={index + 1}
                                                title={question.title}
                                                content={question.content}
                                                showHeader={showQuestionHeaders}
                                                isFirstQuestion={index === 0}
                                                onUpdateTitle={(value) => updateQuestion(question.id, 'title', value)}
                                                onUpdateContent={(value) => updateQuestion(question.id, 'content', value)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <SavePanel
                            title={title}
                            questions={questions}
                            currentCoverLetterId={currentCoverLetterId}
                            onLoad={handleLoadCoverLetter}
                            showQuestionHeaders={showQuestionHeaders}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
