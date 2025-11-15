import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { JournalEntry } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ChevronLeftIcon, EditIcon, TrashIcon, BoldIcon, ItalicIcon, ListIcon } from './Icons';

// Helper to format dates for the list view
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Helper for precise timestamps in the entry detail view
const formatPreciseDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const MemoryVault: React.FC = () => {
  // State for journal entries, persisted in local storage
  const [entries, setEntries] = useLocalStorage<JournalEntry[]>('journalEntries', []);
  
  // State for UI mode and selected entry
  const [view, setView] = useState<'list' | 'view' | 'form'>('list');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  
  // State for sorting
  type SortType = 'createdAt-desc' | 'createdAt-asc' | 'updatedAt-desc' | 'updatedAt-asc';
  const [sortType, setSortType] = useState<SortType>('createdAt-desc');

  // State for search
  const [searchQuery, setSearchQuery] = useState('');

  // State for form fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const displayEntries = [...entries]
    .filter(entry => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      return (
        entry.title.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const [key, order] = sortType.split('-') as ['createdAt' | 'updatedAt', 'asc' | 'desc'];
      const dateA = new Date(a[key]).getTime();
      const dateB = new Date(b[key]).getTime();
      // FIX: Corrected typo `aA` to `dateA` for descending sort.
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });

  // Effect to populate form when editing an entry
  useEffect(() => {
    if (view === 'form' && selectedEntryId) {
      const entryToEdit = entries.find(e => e.id === selectedEntryId);
      if (entryToEdit) {
        setTitle(entryToEdit.title);
        setContent(entryToEdit.content);
      }
    }
    // Note: `entries` is intentionally omitted from dependencies to prevent form state
    // being overwritten by the real-time timestamp update effect. This effect should
    // only populate the form when the view or selected entry changes.
  }, [view, selectedEntryId]);

  // Effect to update timestamp in real-time while editing
  useEffect(() => {
    if (view === 'form' && selectedEntryId) {
      const handler = setTimeout(() => {
        setEntries(prevEntries =>
          prevEntries.map(entry =>
            entry.id === selectedEntryId
              ? { ...entry, updatedAt: new Date().toISOString() }
              : entry
          )
        );
      }, 500); // Debounce to avoid excessive updates

      return () => clearTimeout(handler);
    }
  }, [title, content, view, selectedEntryId, setEntries]);


  const resetForm = () => {
    setTitle('');
    setContent('');
  };

  const handleNewEntryClick = () => {
    resetForm();
    setSelectedEntryId(null);
    setView('form');
  };

  const handleEntryClick = (entry: JournalEntry) => {
    setSelectedEntryId(entry.id);
    setView('view');
  };
  
  const handleEditClick = () => {
      setView('form');
  };
  
  const handleBackToList = () => {
    setSelectedEntryId(null);
    resetForm();
    setView('list');
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;

    const now = new Date().toISOString();

    if (selectedEntryId) {
      // Editing existing entry
      const updatedEntries = entries.map(entry =>
        entry.id === selectedEntryId
          ? { ...entry, title: title.trim(), content: content.trim(), updatedAt: now }
          : entry
      );
      setEntries(updatedEntries);
      setView('view'); // Go back to viewing the entry
    } else {
      // Creating new entry
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        title: title.trim(),
        content: content.trim(),
        createdAt: now,
        updatedAt: now,
      };
      setEntries(prevEntries => [...prevEntries, newEntry]);
      handleBackToList();
    }
  };
  
  const handleDelete = () => {
    if (selectedEntryId && window.confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
        setEntries(entries.filter(entry => entry.id !== selectedEntryId));
        handleBackToList();
    }
  };

  const applyFormatting = (format: 'bold' | 'italic' | 'list') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let markdown, cursorOffset;

    switch (format) {
      case 'bold':
        markdown = `**${selectedText}**`;
        cursorOffset = 2;
        break;
      case 'italic':
        markdown = `*${selectedText}*`;
        cursorOffset = 1;
        break;
      case 'list': {
        if (selectedText === '') {
          markdown = '- ';
          cursorOffset = 2;
        } else {
          const lines = selectedText.split('\n');
          markdown = lines.map(line => line.trim() ? `- ${line}` : '').join('\n');
          cursorOffset = 2; 
        }
        break;
      }
      default:
        return;
    }

    const newContent = content.substring(0, start) + markdown + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start, start + markdown.length);
      } else {
        textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
      }
    }, 0);
  };

  if (view === 'view' || view === 'form') {
      const currentEntry = entries.find(e => e.id === selectedEntryId);

      if (view === 'view' && !currentEntry) {
          handleBackToList();
          return null;
      }

      return (
        <div className="flex flex-col h-full bg-gray-800 text-white">
           <header className="p-4 border-b border-gray-700 shadow-md flex items-center justify-between">
             <div className="flex items-center">
               <button onClick={view === 'form' && selectedEntryId ? () => setView('view') : handleBackToList} className="mr-4 p-2 rounded-full hover:bg-gray-700">
                 <ChevronLeftIcon />
               </button>
               <div>
                 <h1 className="text-xl font-semibold">
                   {view === 'form' ? (selectedEntryId ? 'Edit Entry' : 'New Entry') : currentEntry?.title}
                 </h1>
               </div>
             </div>
             {view === 'view' && (
                 <div className="flex gap-2">
                    <button onClick={handleEditClick} title="Edit Entry" className="p-2 rounded-full hover:bg-gray-700">
                       <EditIcon />
                    </button>
                    <button onClick={handleDelete} title="Delete Entry" className="p-2 rounded-full hover:bg-gray-700 text-red-400">
                       <TrashIcon />
                    </button>
                 </div>
             )}
           </header>
    
           <main className="flex-1 p-6 overflow-y-auto">
             <div className="max-w-4xl mx-auto">
               {view === 'form' ? (
                 <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                   <input
                     type="text"
                     value={title}
                     onChange={e => setTitle(e.target.value)}
                     placeholder="Entry Title"
                     className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-lg font-bold"
                     autoFocus
                   />
                   <div>
                    <div className="flex items-center gap-1 p-2 bg-gray-900 border border-b-0 border-gray-600 rounded-t-lg">
                      <button type="button" title="Bold" onClick={() => applyFormatting('bold')} className="p-2 rounded hover:bg-gray-700"><BoldIcon size={20} /></button>
                      <button type="button" title="Italic" onClick={() => applyFormatting('italic')} className="p-2 rounded hover:bg-gray-700"><ItalicIcon size={20} /></button>
                      <button type="button" title="Bullet List" onClick={() => applyFormatting('list')} className="p-2 rounded hover:bg-gray-700"><ListIcon size={20} /></button>
                    </div>
                    <textarea
                      ref={textareaRef}
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder="Write what's on your mind..."
                      rows={15}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      Supports basic Markdown: use **bold**, *italics*, and `-` for lists.
                    </p>
                   </div>
                   <button
                     type="submit"
                     className="px-6 py-2 bg-teal-600 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                     disabled={!title.trim() || !content.trim()}
                   >
                     Save Entry
                   </button>
                 </form>
               ) : (
                <>
                  {currentEntry && (
                    <div className="mb-6 pb-4 border-b border-gray-700 text-sm text-gray-400 space-y-1">
                      <p><strong className="font-semibold text-gray-300">Created:</strong> {formatPreciseDate(currentEntry.createdAt)}</p>
                      <p><strong className="font-semibold text-gray-300">Last Updated:</strong> {formatPreciseDate(currentEntry.updatedAt)}</p>
                    </div>
                  )}
                  <div className="prose prose-invert prose-sm max-w-none text-gray-200">
                    <ReactMarkdown>{currentEntry?.content || ''}</ReactMarkdown>
                  </div>
                </>
               )}
             </div>
           </main>
         </div>
      )
  }

  // List View
  return (
    <div className="flex flex-col h-full bg-gray-800 text-white">
      <header className="p-4 border-b border-gray-700 shadow-md flex justify-between items-center gap-4 flex-wrap">
        <h1 className="text-xl font-semibold">Memory Vault</h1>
        <div className="flex items-center gap-4">
          <input
            type="search"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 w-48"
          />
          <div>
            <label htmlFor="sort-entries" className="sr-only">Sort entries by</label>
            <select
              id="sort-entries"
              value={sortType}
              onChange={e => setSortType(e.target.value as SortType)}
              className="bg-gray-700 border border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="createdAt-desc">Newest Created</option>
              <option value="createdAt-asc">Oldest Created</option>
              <option value="updatedAt-desc">Newest Updated</option>
              <option value="updatedAt-asc">Oldest Updated</option>
            </select>
          </div>
          <button
            onClick={handleNewEntryClick}
            className="px-4 py-2 bg-teal-600 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
          >
            New Entry
          </button>
        </div>
      </header>
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {displayEntries.length === 0 ? (
            <div className="text-center text-gray-400 py-16">
              <h2 className="text-2xl font-semibold mb-2">{searchQuery ? 'No Results Found' : 'Your Vault is Empty'}</h2>
              <p>{searchQuery ? `Your search for "${searchQuery}" did not match any entries.` : 'The Memory Vault is a safe space to record your thoughts and feelings.'}</p>
              <p className="mt-4">{searchQuery ? 'Try searching for something else.' : 'Click "New Entry" to begin your first journal entry.'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayEntries.map(entry => (
                <article
                  key={entry.id}
                  onClick={() => handleEntryClick(entry)}
                  className="p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                >
                  <h2 className="text-lg font-bold mb-1 truncate">{entry.title}</h2>
                  <p className="text-sm text-gray-400">
                    {formatDate(entry.createdAt)}
                  </p>
                  <p className="text-gray-300 mt-2 text-sm line-clamp-2">{entry.content}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MemoryVault;