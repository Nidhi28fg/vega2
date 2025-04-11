import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import './ImageEditor.css';

const ImageEditor = () => {
    const [searchParams] = useSearchParams();
    const imageUrl = searchParams.get('imageUrl');
    const [error, setError] = useState(null);
    const canvasRef = useRef(null);
    const textareaRef = useRef(null); // Ref for the textarea
    const [canvasContext, setCanvasContext] = useState(null);

    const [textLayers, setTextLayers] = useState([]);
    const [selectedLayerIndex, setSelectedLayerIndex] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState(0);
    const [dragStartY, setDragStartY] = useState(0);
    const [isTextareaVisible, setIsTextareaVisible] = useState(false); // Control visibility of textarea
    const [textareaPosition, setTextareaPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });  // Position for textarea


    // --- Initialize Canvas Context ---
    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            setCanvasContext(ctx);
            canvasRef.current.addEventListener('mousedown', handleMouseDown);
            canvasRef.current.addEventListener('mousemove', handleMouseMove);
            canvasRef.current.addEventListener('mouseup', handleMouseUp);
            canvasRef.current.addEventListener('mouseout', handleMouseUp);  // Important!

            return () => { // Cleanup event listeners on unmount
                if (canvasRef.current) { // Check if canvasRef.current is not null
                    canvasRef.current.removeEventListener('mousedown', handleMouseDown);
                    canvasRef.current.removeEventListener('mousemove', handleMouseMove);
                    canvasRef.current.removeEventListener('mouseup', handleMouseUp);
                    canvasRef.current.removeEventListener('mouseout', handleMouseUp);
                }
            };
        }
    }, []);

    // --- Draw Image on Canvas ---
    useEffect(() => {
        if (imageUrl && canvasContext) {
            const img = new Image();
            img.onload = () => {
                clearCanvas();  // Clear canvas before drawing image
                canvasContext.drawImage(img, 10, 10);
            };
            img.onerror = () => {
                setError("Failed to load image from URL.");
            };
            img.crossOrigin = "anonymous";
            img.src = imageUrl;
        }
    }, [imageUrl, canvasContext]);

    const clearCanvas = () => {
        if (!canvasContext) return;
        canvasContext.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    // --- Draw All on HTML Canvas ---
    useEffect(() => {
        if (canvasContext) {
            clearCanvas();  // Clear Canvas
            if (imageUrl) {
                const img = new Image();
                img.onload = () => {
                    canvasContext.drawImage(img, 10, 10);
                    drawAll();
                };
                img.onerror = () => {
                    setError("Failed to load image from URL.");
                };
                img.crossOrigin = "anonymous";
                img.src = imageUrl;
            } else {
                drawAll();
            }
        }
    }, [canvasContext, textLayers, imageUrl, isTextareaVisible]);


    const drawAll = () => {
        if (!canvasContext) return;

        textLayers.forEach((layer, index) => {
            canvasContext.font = `${layer.fontSize}px ${layer.fontFamily}`;
            canvasContext.fillStyle = layer.color;
            canvasContext.fillText(layer.text, layer.x, layer.y);

            // Draw selection box
            if (index === selectedLayerIndex) {
                drawSelectionBox(layer);
            }
        });
    }

    const drawSelectionBox = (layer) => {
        canvasContext.strokeStyle = 'blue';
        canvasContext.lineWidth = 1;
        canvasContext.strokeRect(layer.x, layer.y - layer.fontSize, layer.width, layer.fontSize + 5);
    };


    const handleMouseDown = (e) => {
        const mouseX = e.clientX - canvasRef.current.offsetLeft;
        const mouseY = e.clientY - canvasRef.current.offsetTop;

        for (let i = 0; i < textLayers.length; i++) {
            const layer = textLayers[i];
            if (mouseX >= layer.x && mouseX <= layer.x + layer.width && mouseY >= layer.y - layer.fontSize && mouseY <= layer.y) {
                setSelectedLayerIndex(i);
                setIsDragging(true);
                setDragStartX(mouseX - layer.x);
                setDragStartY(mouseY - layer.y);
                showTextarea(layer);
                return;  // Exit after first hit
            }
        }
        setSelectedLayerIndex(null);  // Deselect if nothing was hit
        setIsTextareaVisible(false);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;

        const mouseX = e.clientX - canvasRef.current.offsetLeft;
        const mouseY = e.clientY - canvasRef.current.offsetTop;

        setTextLayers(prevLayers => {
            return prevLayers.map((layer, index) => {
                if (index === selectedLayerIndex) {
                    return {
                        ...layer,
                        x: mouseX - dragStartX,
                        y: mouseY - dragStartY,
                    };
                }
                return layer;
            });
        });
        if (selectedLayerIndex !== null) {
          updateTextareaPosition(textLayers[selectedLayerIndex]);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };


    const addTextLayer = () => {
        const newLayer = {
            text: '',
            x: 50,
            y: 50,
            width: 150,
            height: 30,
            fontSize: 24,
            fontFamily: 'Arial',
            color: 'black',
        };
        setTextLayers([...textLayers, newLayer]);
        setSelectedLayerIndex(textLayers.length); // Select the new layer
        showTextarea(newLayer);
    };

    const showTextarea = (layer) => {
      setTextareaPosition({
          x: layer.x,
          y: layer.y - layer.fontSize,
          width: layer.width,
          height: layer.fontSize + 5,
      });
      setIsTextareaVisible(true);
      setTimeout(() => {
          if (textareaRef.current) {
              textareaRef.current.focus();
          }
      }, 0);
  };

  const updateTextareaPosition = (layer) => {
    setTextareaPosition({
        x: layer.x,
        y: layer.y - layer.fontSize,
        width: layer.width,
        height: layer.fontSize + 5,
    });
  };

  const handleTextareaChange = (e) => {
    const newText = e.target.value;
    setTextLayers(prevLayers => {
        return prevLayers.map((layer, index) => {
            if (index === selectedLayerIndex) {
                return {
                    ...layer,
                    text: newText,
                };
            }
            return layer;
        });
    });
};



const addCircle = () => {
    if (!canvasContext) {
        setError("Editor not ready. Try again after it loads.");
        return;
    }

    try {
        canvasContext.beginPath();
        canvasContext.arc(300, 200, 50, 0, 2 * Math.PI);
        canvasContext.fillStyle = 'rgba(255, 255, 0, 0)';
        canvasContext.fill();
        canvasContext.strokeStyle = 'red';
        canvasContext.stroke();
        console.log("Circle added.");
    } catch (e) {
        console.error(`Error adding circle:`, e);
        setError(`Could not add circle. Please try again.`);
    }
};

const addTriangle = () => {
    if (!canvasContext) {
        setError("Editor not ready. Try again after it loads.");
        return;
    }

    try {
        canvasContext.beginPath();
        canvasContext.moveTo(150, 20);
        canvasContext.lineTo(270, 150);
        canvasContext.lineTo(30, 150);
        canvasContext.closePath();
        canvasContext.fillStyle = 'rgba(255, 255, 0, 0)';
        canvasContext.fill();
        canvasContext.strokeStyle = 'green';
        canvasContext.stroke();
        console.log("Triangle added.");
    } catch (e) {
        console.error(`Error adding triangle:`, e);
        setError(`Could not add triangle. Please try again.`);
    }
};

const addRectangle = () => {
    if (!canvasContext) {
        setError("Editor not ready. Try again after it loads.");
        return;
    }

    try {
        canvasContext.fillStyle = 'rgba(255, 255, 0, 0)';
        canvasContext.fillRect(20, 20, 150, 100);
        canvasContext.strokeStyle = 'blue';
        canvasContext.strokeRect(20, 20, 150, 100);
        console.log("Rectangle added.");
    } catch (e) {
        console.error(`Error adding rectangle:`, e);
        setError(`Could not add rectangle. Please try again.`);
    }
};

const addPolygon = () => {
  if (!canvasContext) {
      setError("Editor not ready. Try again after it loads.");
      return;
  }

  try {
      canvasContext.beginPath();
      canvasContext.moveTo(200, 50);  // Starting point
      canvasContext.lineTo(300, 100);
      canvasContext.lineTo(350, 0);
      canvasContext.lineTo(400, 100);
      canvasContext.lineTo(500, 50);
      canvasContext.lineTo(400, 150);
      canvasContext.lineTo(350, 200);
      canvasContext.lineTo(300, 150);
      canvasContext.closePath(); // Close the path to form a closed polygon

      canvasContext.fillStyle = 'rgba(255, 255, 0, 0)';  // Semi-transparent yellow
      canvasContext.fill();
      canvasContext.strokeStyle = 'yellow';
      canvasContext.stroke();
      console.log("Polygon added.");

  } catch (e) {
      console.error(`Error adding polygon:`, e);
      setError(`Could not add polygon. Please try again.`);
  }
};

const handleDownloadImage = () => {
    if (!canvasRef.current) {
        setError("Canvas not ready.");
        return;
    }

    const canvas = canvasRef.current;

    try {
        const dataURL = canvas.toDataURL({ format: 'png', quality: 0.8 });
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("Error downloading image:", error);
        setError("Failed to download image. Please try again. Check CORS settings.");
    }
};

    


    return (
        <div className="image-editor-container">
            <h2>Image Editor</h2>
            {error && <div className="error-message" style={{ color: 'red', marginTop: '10px', padding: '5px', border: '1px solid red' }}>Error: {error}</div>}

            <div className="canvas-toolbar" style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={addCircle} style={{ backgroundColor: 'red', color: 'white' }}>Add Circle</button>
                <button onClick={addTriangle} style={{ backgroundColor: 'green', color: 'white' }}>Add Triangle</button>
                <button onClick={addRectangle} style={{ backgroundColor: 'blue', color: 'white' }}>Add Rectangle</button>
                <button onClick={addPolygon} style={{ backgroundColor: 'yellow', color: 'black' }}>Add Polygon</button>
             <button onClick={addTextLayer}>Add Text Layer</button>
</div>
           

            <canvas
                ref={canvasRef}
                id="htmlCanvas"
                width={600}
                height={400}
                style={{ border: '1px solid #d3d3d3' }}
            />

            {isTextareaVisible && (
                <textarea
                    ref={textareaRef}
                    style={{
                        position: 'absolute',
                        top: textareaPosition.y + canvasRef.current.offsetTop,
                        left: textareaPosition.x + canvasRef.current.offsetLeft,
                        width: textareaPosition.width,
                        height: textareaPosition.height,
                        fontSize: textLayers[selectedLayerIndex]?.fontSize || 24,
                        fontFamily: textLayers[selectedLayerIndex]?.fontFamily || 'Arial',
                        color: textLayers[selectedLayerIndex]?.color || 'black',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        resize: 'none',
                        zIndex: 10,
                    }}
                    value={textLayers[selectedLayerIndex]?.text || ''}
                    onChange={handleTextareaChange}
                />
            )}


            <p style={{ fontSize: '0.8em', color: '#555' }}>Add text to the canvas.</p>
            <button onClick={handleDownloadImage} style={{ backgroundColor: '#4CAF50', color: 'white' }}> Download Image </button>
        </div>
    );
};

export default ImageEditor;