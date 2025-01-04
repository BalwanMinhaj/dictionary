import React, { useEffect, useState, useRef } from 'react';

export default function App() {
    const [input, setInput] = useState('');
    const [word, setWord] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [response, setResponse] = useState(null);

    // Create a ref for the audio element
    const audioRef = useRef(null);

    useEffect(() => {
        if (!word.trim()) return; // Skip if word is empty

        async function fetchDictionary() {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
                
                // Handle 404 error for invalid words
                if (res.status === 404) {
                    throw new Error('Word not found. Please check your spelling and try again.');
                }

                if (!res.ok) {
                    throw new Error(`Error: ${res.status} - ${res.statusText}`);
                }

                const data = await res.json();
                setResponse(data); // Store the full JSON response
            } catch (err) {
                setError(err);
                setResponse(null); // Reset response on error
            } finally {
                setLoading(false);
            }
        }

        fetchDictionary();
    }, [word]);

    function handleKeyDown(e) {
        if (e.key === 'Enter' && input.trim()) {  // Trigger only if input is not empty
            setWord(input);
        }
    }

    // Function to play the audio when the icon is clicked
    const playAudio = () => {
        if (audioRef.current) {
            audioRef.current.play();
        }
    };

    return (
        <main>
            <input type="search" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Enter a word" />

            {loading && <div className="loading">
                <div className="skeleton-word"></div>
                <div className="skeleton-phonetic"></div>
                <div className="description">
					<div className="skeleton-description"></div>
					<div className="skeleton-description"></div>
				</div>
            </div>}

            {error && (
                <div className="error">
                    {error.message || 'An unexpected error occurred.'}
                </div>
            )}

            {!loading && !error && response && (
                <div className="meaning">
                    <div className="heading">
                        <h2>{response[0]?.word}</h2>
                        {response[0]?.phonetics?.[0]?.audio && (
                            <div className='audio'>
                                {/* Reference the audio element */}
                                <audio ref={audioRef} src={response[0]?.phonetics?.[0]?.audio} controls={false}></audio>
                                <div onClick={playAudio} className="icon">
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256"><path d="M157.27,21.22a12,12,0,0,0-12.64,1.31L75.88,76H32A20,20,0,0,0,12,96v64a20,20,0,0,0,20,20H75.88l68.75,53.47A12,12,0,0,0,164,224V32A12,12,0,0,0,157.27,21.22ZM36,100H68v56H36Zm104,99.46L92,162.13V93.87l48-37.33ZM212,128a44,44,0,0,1-11,29.11,12,12,0,1,1-18-15.88,20,20,0,0,0,0-26.43,12,12,0,0,1,18-15.86A43.94,43.94,0,0,1,212,128Zm40,0a83.87,83.87,0,0,1-21.39,56,12,12,0,0,1-17.89-16,60,60,0,0,0,0-80,12,12,0,1,1,17.88-16A83.87,83.87,0,0,1,252,128Z"></path></svg>
                                </div>
                            </div>
                        )}
                    </div>

                    <p className='phonetic'>{response[0]?.phonetics?.[0]?.text}</p>
                    <p className='description'>{response[0]?.meanings?.[0]?.definitions?.[0]?.definition}</p>
                </div>
            )}
        </main>
    );
}