import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MoveLeft, MoveRight } from 'lucide-react';

export interface ErrorPageLayoutProps {
    errorCode: string | number;
    title: string;
    description: string;
    primaryActionLabel?: string;
    onPrimaryAction?: () => void;
    showBackButton?: boolean;
}

export const ErrorPageLayout: React.FC<ErrorPageLayoutProps> = ({
    errorCode,
    title,
    description,
    primaryActionLabel = "RETURN TO STORE",
    onPrimaryAction,
    showBackButton = true
}) => {
    const navigate = useNavigate();

    const handlePrimaryAction = () => {
        if (onPrimaryAction) {
            onPrimaryAction();
        } else {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-sans overflow-hidden">
            {/* Minimal Header */}
            <div className="w-full p-8 flex justify-between items-center bg-transparent relative z-20">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md bg-cyan-600 flex items-center justify-center">
                        <span className="text-white font-black text-[10px] leading-none">S</span>
                    </div>
                    <span className="text-xs font-black tracking-widest text-gray-900 uppercase">
                        Simak Fresh
                    </span>
                </div>
                {showBackButton && (
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-400 hover:text-cyan-600 transition-colors uppercase group"
                    >
                        <MoveLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
                        Go Back
                    </button>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative">

                {/* Huge Typographic Error Code */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] select-none z-0 pointer-events-none"
                >
                    <span className="text-[25vw] md:text-[300px] font-black text-gray-100/50 leading-none tracking-tighter">
                        {errorCode}
                    </span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-10 w-full max-w-2xl text-center flex flex-col items-center"
                >
                    {/* Small Error Label */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 border border-gray-200 rounded-full bg-white/50 backdrop-blur-md text-[10px] font-bold tracking-widest text-cyan-700 uppercase shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                        Error {errorCode}
                    </div>

                    {/* Highly legible, clean text */}
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
                        {title}
                    </h1>

                    <p className="text-lg text-gray-500 font-medium max-w-lg mx-auto leading-relaxed mb-12">
                        {description}
                    </p>

                    {/* Beautiful, inviting button */}
                    <button
                        onClick={handlePrimaryAction}
                        className="group flex items-center gap-4 px-8 py-4 bg-white border border-gray-200 rounded-full text-[12px] font-bold tracking-[0.15em] text-gray-900 transition-all duration-300 hover:border-cyan-300 hover:bg-cyan-50/30 hover:shadow-[0_8px_30px_rgba(8,145,178,0.12)] hover:-translate-y-0.5"
                    >
                        <span>{primaryActionLabel}</span>
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 group-hover:bg-cyan-100 group-hover:text-cyan-700 transition-colors">
                            <MoveRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                        </div>
                    </button>

                </motion.div>
            </div>
        </div>
    );
};
