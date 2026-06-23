import React from 'react';

const PageHeader = ({ title, description }) => {
    return (
        <div className="relative border-b border-zinc-800 pb-6 mb-8 mt-2 overflow-hidden">
            {/* Subtle decorative background glow for a premium feel */}
            <div className="absolute top-0 left-0 -translate-y-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100">
                        {title}
                    </h1>
                    <p className="mt-1.5 text-sm md:text-base text-zinc-400 max-w-2xl leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PageHeader;