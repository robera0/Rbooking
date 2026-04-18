import React from "react";
import styled from "styled-components";

// --- First Loader (Crystal) ---
const CrystalWrapper = styled.div`
  .container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loader {
    position: relative;
    width: 200px;
    height: 200px;
    perspective: 800px;
  }

  .crystal {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 60px;
    height: 60px;
    opacity: 0;
    transform-origin: bottom center;
    transform: translate(-50%, -50%) rotateX(45deg) rotateZ(0deg);
    animation:
      spin 4s linear infinite,
      emerge 2s ease-in-out infinite alternate,
      fadeIn 0.3s ease-out forwards;
    border-radius: 10px;
    visibility: hidden;
  }

  @keyframes spin {
    from {
      transform: translate(-50%, -50%) rotateX(45deg) rotateZ(0deg);
    }
    to {
      transform: translate(-50%, -50%) rotateX(45deg) rotateZ(360deg);
    }
  }

  @keyframes emerge {
    0%,
    100% {
      transform: translate(-50%, -50%) scale(0.5);
      opacity: 0;
    }
    50% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
  }

  @keyframes fadeIn {
    to {
      visibility: visible;
      opacity: 0.8;
    }
  }

  .crystal:nth-child(1) {
    background: linear-gradient(45deg, #003366, #336699);
    animation-delay: 0s;
  }

  .crystal:nth-child(2) {
    background: linear-gradient(45deg, #003399, #3366cc);
    animation-delay: 0.3s;
  }

  .crystal:nth-child(3) {
    background: linear-gradient(45deg, #0066cc, #3399ff);
    animation-delay: 0.6s;
  }

  .crystal:nth-child(4) {
    background: linear-gradient(45deg, #0099ff, #66ccff);
    animation-delay: 0.9s;
  }

  .crystal:nth-child(5) {
    background: linear-gradient(45deg, #33ccff, #99ccff);
    animation-delay: 1.2s;
  }

  .crystal:nth-child(6) {
    background: linear-gradient(45deg, #66ffff, #ccffff);
    animation-delay: 1.5s;
  }
`;

const Loader = () => {
  return (
    <CrystalWrapper>
      <div className="container">
        <div className="loader">
          <div className="crystal" />
          <div className="crystal" />
          <div className="crystal" />
          <div className="crystal" />
          <div className="crystal" />
          <div className="crystal" />
        </div>
      </div>
    </CrystalWrapper>
  );
};

// --- Second Loader (EventLoader / Sphere) ---
const SphereWrapper = styled.div`
  .container {
    position: absolute;
    inset: 0;
    zoom: 0.5;

    .loader {
      top: calc(50% - 200px);
      left: calc(50% - 200px);
      animation: girar 8s linear infinite;

      &,
      .sphere,
      .item {
        width: 400px;
        height: 400px;
        position: absolute;
        transform-style: preserve-3d;
        perspective: 10000px;
      }

      .sphere,
      .item {
        top: 0;
        left: 0;
      }

      .sphere {
        transform: rotate(calc(var(--rot) * 20deg));

        &.sphere1 {
          --bg: #f008;
        }

        &.sphere2 {
          --bg: #f0f8;
        }

        &.sphere3 {
          --bg: #ff08;
        }

        &.sphere4 {
          --bg: #0f08;
        }

        &.sphere5 {
          --bg: #0ff8;
        }

        &.sphere6 {
          --bg: #00f8;
        }

        &.sphere7 {
          --bg: #dc1ddf88;
        }

        &.sphere8 {
          --bg: #ffa50088;
        }

        &.sphere9 {
          --bg: #e5b2ca88;
        }
      }

      .item {
        border-radius: 50%;
        background: var(--bg);
        transform: rotateY(calc(var(--rot-y) * 40deg));
      }
    }
  }

  @keyframes girar {
    0% {
      transform: rotateX(0deg) rotateY(0deg);
    }
    100% {
      transform: rotateX(360deg) rotateY(360deg);
    }
  }
`;

export const EventLoader = () => {
  return (
    <SphereWrapper>
      <section className="container">
        <section className="loader">
          <article style={{ "--rot": 0 }} className="sphere sphere1">
            <div className="item" style={{ "--rotY": 1 }} />
            <div className="item" style={{ "--rotY": 2 }} />
            <div className="item" style={{ "--rotY": 3 }} />
            <div className="item" style={{ "--rotY": 4 }} />
            <div className="item" style={{ "--rotY": 5 }} />
            <div className="item" style={{ "--rotY": 6 }} />
            <div className="item" style={{ "--rotY": 7 }} />
            <div className="item" style={{ "--rotY": 8 }} />
            <div className="item" style={{ "--rotY": 9 }} />
          </article>
          <article style={{ "--rot": 1 }} className="sphere sphere2">
            <div className="item" style={{ "--rotY": 1 }} />
            <div className="item" style={{ "--rotY": 2 }} />
            <div className="item" style={{ "--rotY": 3 }} />
            <div className="item" style={{ "--rotY": 4 }} />
            <div className="item" style={{ "--rotY": 5 }} />
            <div className="item" style={{ "--rotY": 6 }} />
            <div className="item" style={{ "--rotY": 7 }} />
            <div className="item" style={{ "--rotY": 8 }} />
            <div className="item" style={{ "--rotY": 9 }} />
          </article>
          <article style={{ "--rot": 2 }} className="sphere sphere3">
            <div className="item" style={{ "--rotY": 1 }} />
            <div className="item" style={{ "--rotY": 2 }} />
            <div className="item" style={{ "--rotY": 3 }} />
            <div className="item" style={{ "--rotY": 4 }} />
            <div className="item" style={{ "--rotY": 5 }} />
            <div className="item" style={{ "--rotY": 6 }} />
            <div className="item" style={{ "--rotY": 7 }} />
            <div className="item" style={{ "--rotY": 8 }} />
            <div className="item" style={{ "--rotY": 9 }} />
          </article>
          <article style={{ "--rot": 3 }} className="sphere sphere4">
            <div className="item" style={{ "--rotY": 1 }} />
            <div className="item" style={{ "--rotY": 2 }} />
            <div className="item" style={{ "--rotY": 3 }} />
            <div className="item" style={{ "--rotY": 4 }} />
            <div className="item" style={{ "--rotY": 5 }} />
            <div className="item" style={{ "--rotY": 6 }} />
            <div className="item" style={{ "--rotY": 7 }} />
            <div className="item" style={{ "--rotY": 8 }} />
            <div className="item" style={{ "--rotY": 9 }} />
          </article>
          <article style={{ "--rot": 4 }} className="sphere sphere5">
            <div className="item" style={{ "--rotY": 1 }} />
            <div className="item" style={{ "--rotY": 2 }} />
            <div className="item" style={{ "--rotY": 3 }} />
            <div className="item" style={{ "--rotY": 4 }} />
            <div className="item" style={{ "--rotY": 5 }} />
            <div className="item" style={{ "--rotY": 6 }} />
            <div className="item" style={{ "--rotY": 7 }} />
            <div className="item" style={{ "--rotY": 8 }} />
            <div className="item" style={{ "--rotY": 9 }} />
          </article>
          <article style={{ "--rot": 5 }} className="sphere sphere6">
            <div className="item" style={{ "--rotY": 1 }} />
            <div className="item" style={{ "--rotY": 2 }} />
            <div className="item" style={{ "--rotY": 3 }} />
            <div className="item" style={{ "--rotY": 4 }} />
            <div className="item" style={{ "--rotY": 5 }} />
            <div className="item" style={{ "--rotY": 6 }} />
            <div className="item" style={{ "--rotY": 7 }} />
            <div className="item" style={{ "--rotY": 8 }} />
            <div className="item" style={{ "--rotY": 9 }} />
          </article>
          <article style={{ "--rot": 6 }} className="sphere sphere7">
            <div className="item" style={{ "--rotY": 1 }} />
            <div className="item" style={{ "--rotY": 2 }} />
            <div className="item" style={{ "--rotY": 3 }} />
            <div className="item" style={{ "--rotY": 4 }} />
            <div className="item" style={{ "--rotY": 5 }} />
            <div className="item" style={{ "--rotY": 6 }} />
            <div className="item" style={{ "--rotY": 7 }} />
            <div className="item" style={{ "--rotY": 8 }} />
            <div className="item" style={{ "--rotY": 9 }} />
          </article>
          <article style={{ "--rot": 7 }} className="sphere sphere8">
            <div className="item" style={{ "--rotY": 1 }} />
            <div className="item" style={{ "--rotY": 2 }} />
            <div className="item" style={{ "--rotY": 3 }} />
            <div className="item" style={{ "--rotY": 4 }} />
            <div className="item" style={{ "--rotY": 5 }} />
            <div className="item" style={{ "--rotY": 6 }} />
            <div className="item" style={{ "--rotY": 7 }} />
            <div className="item" style={{ "--rotY": 8 }} />
            <div className="item" style={{ "--rotY": 9 }} />
          </article>
          <article style={{ "--rot": 8 }} className="sphere sphere9">
            <div className="item" style={{ "--rotY": 1 }} />
            <div className="item" style={{ "--rotY": 2 }} />
            <div className="item" style={{ "--rotY": 3 }} />
            <div className="item" style={{ "--rotY": 4 }} />
            <div className="item" style={{ "--rotY": 5 }} />
            <div className="item" style={{ "--rotY": 6 }} />
            <div className="item" style={{ "--rotY": 7 }} />
            <div className="item" style={{ "--rotY": 8 }} />
            <div className="item" style={{ "--rotY": 9 }} />
          </article>
        </section>
      </section>
    </SphereWrapper>
  );
};

export default Loader;
