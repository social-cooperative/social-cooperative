import styled from 'styled-components'

export default styled.div`
  .main-page {
    font-family: 'Inter', sans-serif;
    color: #3d3d48;
    font-style: normal;
    font-weight: 400;
    font-size: 18px;
    line-height: 1.45;
  }
  .main-page-footer {
    display: flex;
    opacity: 0.5;
    height: 200px;
    background-color: #ccd;
    align-items: center;
    justify-content: center;
    margin-top: 140px;
    color: #64646d;
  }
  .text-white, .preview-container {
    color: white !important;
  }
  p {
    padding: 0;
    margin: 0;
  }
  h1, h2 {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
  ul {
    padding-left: 26px;
  }
  ul li {
    margin-bottom: 26.1px;
    list-style: none;
    position: relative;
  }
  ul li::after {
    content: '';
    display: block;
    position: absolute;
    top: 4px;
    background-image: url('apple-bullet.svg');
    background-size: contain;
    background-repeat: no-repeat;
    left: -20px;
    width: 12px;
    height: 14px;
  }
  .container, .header-container, .preview-container, .page-section {
    width: 100%;
    max-width: 928px;
    margin: 0 auto;
  }
  .header {
    height: 64px;
    position: sticky;
    top: 0;
    background-color: white;
    display: flex;
    align-items: center;
    z-index: 100;
    box-shadow: 0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%);
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .header img {
    margin-left: 16px;
  }
  .preview {
    padding: 30px 0;
    background-color: #60ce60;
    margin-bottom: 32px;
    min-height: 248px;
    position: relative;
  }
  .preview-overlay {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background-color: #60ce60;
  }
  .preview-heading {
    font-weight: 800;
    font-size: 32px;
    line-height: 39px;
    margin-bottom: 12px;
  }
  .preview-subheading {
    font-size: 22px;
    line-height: 27px;
    margin-bottom: 18px;
  }
  .preview-button {
    margin-top: 24px;
    background-color: white;
    border: 0;
    border-radius: 4px;
    color: #239f23;
    font-weight: 600;
    font-size: 22px;
    line-height: 17px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    font-family: 'Inter', sans-serif;
    text-transform: uppercase;
    cursor: pointer;
    text-decoration: none;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
    transition-timing-function: ease-in;
    transition-duration: 0.2s;
    transition-property: opacity, box-shadow;
  }
  .preview-button:hover, .preview-button:focus {
    opacity: 0.8;
  }
  .preview-button:active {
    opacity: 0.7;
    box-shadow: none;
  }
  .page-section {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
 }
  @media (min-width: 981px) {
    .page-section {
      flex-direction: row;
   }
 }
  .page-section h2 {
    font-weight: 800;
    font-size: 36px;
    line-height: 44px;
    color: #239f23;
    margin-bottom: 20px;
 }
  .page-section p {
    margin-bottom: 26.1px;
    letter-spacing: 0.04px;
 }
  @media (min-width: 981px) {
    .page-section p:last-of-type {
      margin-bottom: 39.15px;
   }
 }
  .page-section-content {
    width: 100%;
    max-width: 800px;
 }
  @media (min-width: 981px) {
    .page-section-content {
      max-width: 600px;
   }
 }
  .page-section-aside {
    width: 100%;
    max-width: 318px;
    flex-grow: 0;
    margin-bottom: 40px;
 }
  @media (min-width: 981px) {
    .page-section-aside {
      margin-bottom: 0;
      justify-content: end;
      align-items: baseline;
      display: flex;
   }
 }
  .page-section-aside.out-of-order {
    margin-top: -380px;
 }
  .page-section-aside img {
    display: block;
    max-width: 100%;
 }
  .qr-item {
    display: flex;
    flex-direction: column;
    width: 260px;
    text-align: center;
 }
  .qr-item-label {
    font-weight: 400;
    font-size: 18px;
    line-height: 1.35;
    color: #64646d;
 }
  @media (min-width: 981px) {
    .qr-item-label {
      font-size: 14px;
   }
 }
`