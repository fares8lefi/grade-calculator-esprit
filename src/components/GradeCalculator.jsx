import React, { useState, useEffect } from 'react';

/**
 * GradeCalculator Component
 * A comprehensive grade management system for ESPRIT Engineering students
 * Features: Grade input, average calculation, data persistence, and visual feedback
 */
const GradeCalculator = () => {
    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================
    
    // Load saved grades from localStorage or initialize empty array
    const [grades, setGrades] = useState(() => {
        const saved = localStorage.getItem('espritGradeData');
        return saved ? JSON.parse(saved) : [];
    });

    // Form input state
    const [formData, setFormData] = useState({
        subject: '',
        coef: 1,
        cc: '',
        tp: '',
        exam: ''
    });

    // ============================================================================
    // SIDE EFFECTS
    // ============================================================================
    
    // Persist grades to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('espritGradeData', JSON.stringify(grades));
    }, [grades]);

    // ============================================================================
    // CALCULATION UTILITIES
    // ============================================================================
    
    /**
     * Calculate weighted average based on available grades
     * - CC + TP + Exam: 30% + 20% + 50%
     * - CC or TP + Exam: 40% + 60%
     * - Exam only: 100%
     */
    const calculateAverage = (cc, tp, exam) => {
        const hasCC = cc !== '' && cc !== null && !isNaN(cc);
        const hasTP = tp !== '' && tp !== null && !isNaN(tp);
        const valCC = hasCC ? parseFloat(cc) : 0;
        const valTP = hasTP ? parseFloat(tp) : 0;
        const valExam = parseFloat(exam) || 0;

        if (hasCC && hasTP) {
            return (valCC * 0.3 + valTP * 0.2 + valExam * 0.5);
        }
        if (hasCC || hasTP) {
            const note1 = hasCC ? valCC : valTP;
            return (note1 * 0.4 + valExam * 0.6);
        }
        return valExam;
    };

    /**
     * Get visual styling parameters based on average score
     * Returns color, background, border, icon, and label
     */
    const getStyleParams = (avg) => {
        if (avg >= 16) return { 
            color: 'text-emerald-600', 
            bg: 'bg-gradient-to-r from-emerald-50 to-green-50', 
            border: 'border-emerald-400', 
            icon: '🎯', 
            label: 'Excellent' 
        };
        if (avg >= 10) return { 
            color: 'text-gray-900', 
            bg: 'bg-gradient-to-r from-gray-50 to-slate-50', 
            border: 'border-gray-300', 
            icon: '✅', 
            label: 'Validé' 
        };
        if (avg >= 8) return { 
            color: 'text-amber-600', 
            bg: 'bg-gradient-to-r from-amber-50 to-orange-50', 
            border: 'border-amber-400', 
            icon: '⚠️', 
            label: 'Rattrapage' 
        };
        return { 
            color: 'text-rose-600', 
            bg: 'bg-gradient-to-r from-rose-50 to-red-50', 
            border: 'border-rose-400', 
            icon: '❌', 
            label: 'Échec' 
        };
    };

    // ============================================================================
    // COMPUTED VALUES
    // ============================================================================
    
    const totalCoef = grades.reduce((acc, curr) => acc + parseFloat(curr.coef), 0);
    
    const totalPoints = grades.reduce((acc, curr) => {
        const avg = calculateAverage(curr.cc, curr.tp, curr.exam);
        return acc + (avg * parseFloat(curr.coef));
    }, 0);

    const generalAvg = totalCoef > 0 ? (totalPoints / totalCoef).toFixed(2) : '0.00';
    const validatedCount = grades.filter(g => calculateAverage(g.cc, g.tp, g.exam) >= 10).length;
    const dangerCount = grades.filter(g => calculateAverage(g.cc, g.tp, g.exam) < 8).length;

    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.subject || formData.exam === '') return;

        // Add new grade
        setGrades([...grades, { ...formData, id: Date.now() }]);
        
        // Reset form
        setFormData({ subject: '', coef: 1, cc: '', tp: '', exam: '' });
        
        // Auto-scroll to table on mobile
        if (window.innerWidth < 1280) {
            setTimeout(() => {
                document.getElementById('grades-table')?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 100);
        }
    };

    const deleteGrade = (id) => {
        if (confirm('Supprimer cette matière ?')) {
            setGrades(grades.filter(g => g.id !== id));
        }
    };

    const resetAll = () => {
        if (confirm('Voulez-vous tout effacer ?')) {
            setGrades([]);
        }
    };

    // ============================================================================
    // RENDER
    // ============================================================================
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-gray-50 to-neutral-100">
            
            {/* ====================================================================
                HEADER SECTION
            ==================================================================== */}
            <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 backdrop-blur-lg bg-white/95">
                <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 md:py-5">
                    <div className="flex items-center justify-between">
                        
                        {/* Logo & Title */}
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-[#CE0033] to-rose-600 rounded-lg blur opacity-25"></div>
                                <img 
                                    src="/image.png" 
                                    alt="ESPRIT Logo" 
                                    className="relative w-12 h-12 md:w-14 md:h-14 object-contain" 
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-black uppercase">
                                    Grade<span className="text-[#CE0033]">Flow</span>
                                </h1>
                                <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">
                                    ESPRIT Engineering
                                </p>
                            </div>
                        </div>
                        
                        {/* Date Display */}
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Aujourd'hui
                                </div>
                                <div className="font-mono text-sm font-bold text-gray-700">
                                    {new Date().toLocaleDateString('fr-FR')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ====================================================================
                MAIN CONTENT
            ==================================================================== */}
            <main className="max-w-7xl mx-auto px-6 md:px-8 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* ================================================================
                        LEFT COLUMN: Form & Average Display
                    ================================================================ */}
                    <div className="lg:col-span-5 space-y-8">
                        
                        {/* Grade Input Form */}
                        <div className="relative group">
                            {/* Glow Effect */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#CE0033] via-rose-600 to-[#CE0033] rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition duration-500"></div>
                            
                            <div className="relative bg-gradient-to-br from-black via-neutral-900 to-black text-white rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
                                {/* Background Icon */}
                                <div className="absolute top-0 right-0 p-6 opacity-5">
                                    <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/>
                                    </svg>
                                </div>
                                
                                <div className="p-8 relative z-10">
                                    {/* Form Header */}
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-bold flex items-center gap-3">
                                            <span className="w-1.5 h-7 bg-gradient-to-b from-[#CE0033] to-rose-600 rounded-full"></span>
                                            Saisie des Notes
                                        </h2>
                                        <div className="flex items-center gap-2 text-xs font-mono text-gray-500 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-800">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span>v2.0</span>
                                        </div>
                                    </div>
                                    
                                    {/* Form Fields */}
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        
                                        {/* Subject Name */}
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase font-bold text-gray-400 tracking-wider ml-1">
                                                Nom de la Matière
                                            </label>
                                            <input
                                                type="text"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleInputChange}
                                                placeholder="Ex: Base de Données"
                                                className="w-full bg-neutral-900/50 backdrop-blur border border-neutral-700 text-white px-5 py-3.5 rounded-xl focus:border-[#CE0033] focus:ring-2 focus:ring-[#CE0033]/20 focus:outline-none transition-all placeholder-gray-600 font-medium"
                                                required
                                            />
                                        </div>

                                        {/* Coefficient */}
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase font-bold text-gray-400 tracking-wider ml-1">
                                                Coefficient
                                            </label>
                                            <input
                                                type="number"
                                                name="coef"
                                                value={formData.coef}
                                                onChange={handleInputChange}
                                                min="0"
                                                step="any"
                                                className="w-full bg-neutral-900/50 backdrop-blur border border-neutral-700 text-white px-5 py-3.5 rounded-xl focus:border-[#CE0033] focus:ring-2 focus:ring-[#CE0033]/20 focus:outline-none transition-all placeholder-gray-600 font-mono text-lg"
                                                required
                                                placeholder="1.0"
                                            />
                                        </div>

                                        {/* CC & TP (Optional Grades) */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs uppercase font-bold text-gray-400 tracking-wider ml-1">
                                                    CC <span className="text-[10px] text-gray-600 normal-case font-normal">(Optionnel)</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    name="cc"
                                                    value={formData.cc}
                                                    onChange={handleInputChange}
                                                    min="0" 
                                                    max="20" 
                                                    step="any"
                                                    className="w-full bg-neutral-900/50 backdrop-blur border border-neutral-700 text-white px-4 py-3.5 rounded-xl focus:border-[#CE0033] focus:ring-2 focus:ring-[#CE0033]/20 focus:outline-none transition-all placeholder-gray-600 font-mono"
                                                    placeholder="/20"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs uppercase font-bold text-gray-400 tracking-wider ml-1">
                                                    TP <span className="text-[10px] text-gray-600 normal-case font-normal">(Optionnel)</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    name="tp"
                                                    value={formData.tp}
                                                    onChange={handleInputChange}
                                                    min="0" 
                                                    max="20" 
                                                    step="any"
                                                    className="w-full bg-neutral-900/50 backdrop-blur border border-neutral-700 text-white px-4 py-3.5 rounded-xl focus:border-[#CE0033] focus:ring-2 focus:ring-[#CE0033]/20 focus:outline-none transition-all placeholder-gray-600 font-mono"
                                                    placeholder="/20"
                                                />
                                            </div>
                                        </div>

                                        {/* Final Exam (Required) */}
                                        <div className="space-y-2 pt-2">
                                            <label className="text-xs uppercase font-bold text-[#CE0033] tracking-wider ml-1">
                                                Examen Final
                                            </label>
                                            <input
                                                type="number"
                                                name="exam"
                                                value={formData.exam}
                                                onChange={handleInputChange}
                                                min="0" 
                                                max="20" 
                                                step="any"
                                                className="w-full bg-white text-black border-2 border-gray-200 px-5 py-4 rounded-xl focus:border-[#CE0033] focus:ring-4 focus:ring-[#CE0033]/10 focus:outline-none transition-all placeholder-gray-300 font-bold font-mono text-2xl shadow-inner"
                                                required
                                                placeholder="00.00"
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <button 
                                            type="submit" 
                                            className="w-full mt-6 bg-gradient-to-r from-[#CE0033] to-rose-600 hover:from-rose-600 hover:to-[#CE0033] text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                                        >
                                            <span className="tracking-widest">CALCULER</span>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                            </svg>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* General Average Display Card */}
                        <div className="relative group">
                            <div className={`absolute -inset-1 rounded-3xl blur-lg opacity-20 transition ${parseFloat(generalAvg) >= 10 ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-rose-400 to-red-500'}`}></div>
                            
                            <div className="relative bg-white rounded-2xl p-10 shadow-lg border border-gray-100">
                                {/* Top Color Bar */}
                                <div className={`absolute top-0 left-0 w-full h-2 ${parseFloat(generalAvg) >= 10 ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-rose-500 to-red-600'}`}></div>
                                
                                <div className="text-center">
                                    <h3 className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-4">
                                        Moyenne Générale
                                    </h3>
                                    
                                    {/* Large Average Display */}
                                    <div className="flex items-baseline justify-center gap-2 mb-4">
                                        <span className={`text-7xl md:text-8xl font-black tracking-tighter ${parseFloat(generalAvg) >= 10 ? 'text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 to-green-700' : 'text-transparent bg-clip-text bg-gradient-to-br from-rose-600 to-red-700'}`}>
                                            {generalAvg}
                                        </span>
                                        <span className="text-2xl text-gray-300 font-bold">/20</span>
                                    </div>

                                    {/* Status Badge */}
                                    <div className={`inline-block px-6 py-2 rounded-full text-sm font-bold border-2 ${parseFloat(generalAvg) >= 10 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                        {parseFloat(generalAvg) >= 10 ? 'Admis' : 'Non Admis'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ================================================================
                        RIGHT COLUMN: Statistics & Grades Table
                    ================================================================ */}
                    <div className="lg:col-span-7 space-y-8">
                        
                        {/* KPI Cards Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            
                            {/* Total Subjects */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                                    Total Matières
                                </div>
                                <div className="text-4xl font-black text-black">
                                    {grades.length}
                                </div>
                            </div>
                            
                            {/* Total Coefficients */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                                    Total Coefs
                                </div>
                                <div className="text-4xl font-black text-black">
                                    {totalCoef.toFixed(1)}
                                </div>
                            </div>
                            
                            {/* Validated Subjects */}
                            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border-l-4 border-l-emerald-500 shadow-sm">
                                <div className="text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-2">
                                    Validées
                                </div>
                                <div className="text-4xl font-black text-emerald-800">
                                    {validatedCount}
                                </div>
                            </div>
                            
                            {/* Failed Subjects */}
                            <div className="bg-gradient-to-br from-rose-50 to-red-50 p-6 rounded-2xl border-l-4 border-l-rose-500 shadow-sm">
                                <div className="text-rose-700 text-[10px] font-bold uppercase tracking-wider mb-2">
                                    En Échec
                                </div>
                                <div className="text-4xl font-black text-rose-800">
                                    {dangerCount}
                                </div>
                            </div>
                        </div>

                        {/* Grades Table */}
                        <div id="grades-table" className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            
                            {/* Table Header */}
                            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gradient-to-br from-black to-neutral-800 text-white p-2.5 rounded-xl">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-black">Relevé de Notes</h3>
                                            <p className="text-xs text-gray-400">
                                                {grades.length} matière{grades.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Reset Button */}
                                    {grades.length > 0 && (
                                        <button 
                                            onClick={resetAll}
                                            className="px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-100"
                                        >
                                            Tout Effacer
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Empty State */}
                            {grades.length === 0 ? (
                                <div className="p-16 text-center">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                        </svg>
                                    </div>
                                    <h4 className="font-bold text-gray-900 text-lg mb-2">Commencez ici</h4>
                                    <p className="text-gray-400 text-sm max-w-xs mx-auto">
                                        Ajoutez votre première matière pour voir apparaître votre bulletin.
                                    </p>
                                </div>
                            ) : (
                                /* Grades Table */
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    Matière
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                                    CC
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                                    TP
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                                                    Examen
                                                </th>
                                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    Coef
                                                </th>
                                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    Moyenne
                                                </th>
                                                <th className="px-6 py-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {grades.map((grade, index) => {
                                                const avg = calculateAverage(grade.cc, grade.tp, grade.exam);
                                                const style = getStyleParams(avg);

                                                return (
                                                    <tr key={grade.id} className="hover:bg-gray-50 transition-colors">
                                                        {/* Subject Name */}
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                                                    {index + 1}
                                                                </div>
                                                                <span className="font-bold text-gray-900">
                                                                    {grade.subject}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        
                                                        {/* CC Grade */}
                                                        <td className="px-6 py-5 text-right font-mono text-sm text-gray-500 hidden sm:table-cell">
                                                            {grade.cc || '-'}
                                                        </td>
                                                        
                                                        {/* TP Grade */}
                                                        <td className="px-6 py-5 text-right font-mono text-sm text-gray-500 hidden sm:table-cell">
                                                            {grade.tp || '-'}
                                                        </td>
                                                        
                                                        {/* Exam Grade */}
                                                        <td className="px-6 py-5 text-right font-mono font-bold text-black hidden sm:table-cell">
                                                            {grade.exam}
                                                        </td>
                                                        
                                                        {/* Coefficient */}
                                                        <td className="px-6 py-5 text-center">
                                                            <span className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-bold text-gray-600">
                                                                ×{grade.coef}
                                                            </span>
                                                        </td>
                                                        
                                                        {/* Average with Status */}
                                                        <td className="px-6 py-5 text-center">
                                                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 ${style.bg} ${style.color} ${style.border}`}>
                                                                <span className="font-mono">{avg.toFixed(2)}</span>
                                                                
                                                            </div>
                                                        </td>
                                                        
                                                        {/* Delete Button */}
                                                        <td className="px-6 py-5 text-center">
                                                            <button
                                                                onClick={() => deleteGrade(grade.id)}
                                                                className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-300 hover:bg-rose-50 hover:text-rose-600 transition-all"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 py-8 bg-white mt-12">
                <div className="max-w-7xl mx-auto px-6 md:px-8 text-center">
                    <p className="text-gray-400 text-sm font-medium mb-1">
                        Créé par <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CE0033] to-rose-600 font-bold">Phares</span> © {new Date().getFullYear()}
                    </p>
                    <p className="text-[10px] text-gray-300 uppercase tracking-widest">
                        ESPRIT Engineering Project
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default GradeCalculator;