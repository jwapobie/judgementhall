import React, {useCallback, useState} from 'react';
import toaster from './Toaster.png';
import toaster_angry from './Toaster_Angry.png'
import {useDropzone} from 'react-dropzone'
import './App.css';
import Jimp from 'jimp'

// public method for encoding an Uint8Array to base64 -- used to convert buffer to displayable image
function encode (input) {
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    while (i < input.length) {
        chr1 = input[i++];
        chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index 
        chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }
        output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                  keyStr.charAt(enc3) + keyStr.charAt(enc4);
    }
    return output;
}

function MyDropzone(props) {

  const [displayElement, updateDisplay] = useState(<p>Drag 'n' drop some files here, or click to select files</p>);

  const statefunc = props.statefunc;

  const multiple = false;

  const disabled = false;

  const onDropAccepted = useCallback(acceptedFiles => {

    const reader = new FileReader()

    reader.onabort = () => console.log('file reading was aborted')
    reader.onerror = () => console.log('file reading has failed')
    reader.onloadend = (e) => {
      // Do whatever you want with the file contents
      const buffer = reader.result
      const bytes = new Uint8Array(buffer)

      Jimp.read(buffer).then(img => {
    		let count=0;
    		//img.convolute([[0, 1, 0], [1, -4, 1], [0, 1, 0]]);
    		img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => {
    			let red = img.bitmap.data[idx + 0];
    			let green = img.bitmap.data[idx + 1];
    			let blue = img.bitmap.data[idx + 2];
    			// let alpha = img.bitmap.data[idx + 3];
    			if (x > img.bitmap.width / 2) count = count - red;
    			else count = count + red;
    			if (y > img.bitmap.height / 2) count = count -blue;
    			else count = count + blue;
    			if (x/y > img.bitmap.width/img.bitmap.height) count = count - green;
    			else count = count + green;


    			if (x === img.bitmap.width - 1 && y === img.bitmap.height - 1) {
    				// image scan finished, do your stuff

    				count = count / (img.bitmap.width * img.bitmap.height)
            let string;
            if (count >= 0) {
              string = "This image is KEK! Good job."
              statefunc(0)
            } else {
              string = "Um. This is CRINGE."
              statefunc(1)
            }
    				//let string = "This image has a score of "+ count;
    				updateDisplay(
    					<div>
    					<p><small>{reader.currentFile.path}</small><br/>{string}</p>
    					<img src={`data:image/${reader.currentFile.type};base64,${encode(bytes)}`} alt="Input could not be displayed"/>
    					</div>
    				)
    			}
        })

      }).catch(err => {
      	updateDisplay(
	      	<div>
	      		<p>{reader.currentFile.path} - This image is too powerful!</p>
	      		<p>{err.message}</p>
	      		<img src={`data:image/${reader.currentFile.type};base64,${encode(bytes)}`} alt="Input could not be displayed"/>
	     	</div>
      	)
      })

      // updateDisplay(
      // 	<div>
      // 		<p>{reader.currentFile.path} - Check another file?</p>
      // 		<img src={`data:image/${reader.currentFile.type};base64,${btoa(binaryStr)}`} alt="Input could not be displayed"/>
      // 	</div>
      // )
    }

    acceptedFiles.forEach(file => {
    	reader.currentFile = file
    	reader.readAsArrayBuffer(file)
    })
  }, [statefunc])
  function onDropRejected(files) {
  	updateDisplay(<p>Sorry, I only accept image files!</p>)
  }



  const accept = 'image/*'

  const {getRootProps, getInputProps} = useDropzone({onDropAccepted, onDropRejected, accept, disabled, multiple})

  // const files = acceptedFiles.map(file => (

  // 	<li key={file.path}>
  // 		{file.path} - {file.size} bytes
  // 	</li> 
  // ));

  return (
    <section className="container">
	    <div className="inputArea" {...getRootProps()}>
	      <input {...getInputProps()} />
	      {displayElement}
	    </div>
	    
    </section>
  );
}
//		<aside className="FilesList">
//	    	<h4>Files</h4>
//	    	<ul>{files}</ul>
//	    </aside>

function App(){
  const [lastResult, setLastResult] = useState(0);

  const getLogoImage = () => (lastResult === 0) ? toaster : toaster_angry
  
    return (
      <div className="App">
        <header className="App-header">
          <img src={getLogoImage()} className="App-logo" alt="logo" />
          <p>
            Toaster's Judgement Hall
          </p>

          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Made with React
          </a>
        </header>
        <div className="grid">
        	<div className="label">
          	<p>
          		Welcome back to KEK OR CRINGE with Toaster. <br/>Now, show me your meme!
          	</p>
          </div>
          <div className = "dropzone">
          	<MyDropzone statefunc= {setLastResult}/>
          </div>
        </div>
        <div className="footer">
          <p>If you have any complaints about my judgement, head on over to our Patreon...</p>
        </div>
      </div>
    ); 
  
}

export default App;