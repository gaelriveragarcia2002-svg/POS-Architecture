import { DestroyRef, inject, Injectable } from '@angular/core';
import { gsap } from 'gsap';

@Injectable()
export class GSAPService {
    
  // * Inyeccion de depenencias.
  private readonly _destroyRef = inject(DestroyRef);

  // * Metodos del servicio.
  // Cada componente registra solo los plugins que usa (DrawSVGPlugin, MorphSVGPlugin...), así no entran en los chunks que no los necesitan.
  public registerPlugins(...plugins: object[]): void {
    gsap.registerPlugin(...plugins);
  }

  public createContext(
    scope: HTMLElement,
    setup: gsap.ContextFunc,
    destroyRef: DestroyRef = this._destroyRef,
  ): gsap.Context {
    const ctx = gsap.context(setup, scope);
    destroyRef.onDestroy(() => ctx.revert());
    return ctx;
  }

  public to(
    targets: gsap.TweenTarget,
    vars: gsap.TweenVars,
    destroyRef: DestroyRef = this._destroyRef,
  ): gsap.core.Tween {
    return this._autoKill(gsap.to(targets, vars), destroyRef);
  }

  public from(
    targets: gsap.TweenTarget,
    vars: gsap.TweenVars,
    destroyRef: DestroyRef = this._destroyRef,
  ): gsap.core.Tween {
    return this._autoKill(gsap.from(targets, vars), destroyRef);
  }

  public fromTo(
    targets: gsap.TweenTarget,
    fromVars: gsap.TweenVars,
    toVars: gsap.TweenVars,
    destroyRef: DestroyRef = this._destroyRef,
  ): gsap.core.Tween {
    return this._autoKill(gsap.fromTo(targets, fromVars, toVars), destroyRef);
  }

  public set(
    targets: gsap.TweenTarget,
    vars: gsap.TweenVars,
  ): gsap.core.Tween {
    return gsap.set(targets, vars);
  }

  public timeline(
    vars?: gsap.TimelineVars,
    destroyRef: DestroyRef = this._destroyRef,
  ): gsap.core.Timeline {
    return this._autoKill(gsap.timeline(vars), destroyRef);
  }

  public killTweensOf(targets: gsap.TweenTarget): void {
    gsap.killTweensOf(targets);
  }

  // * Metodos privados.
  private _autoKill<T extends gsap.core.Animation>(
    animation: T,
    destroyRef: DestroyRef,
  ): T {
    destroyRef.onDestroy(() => animation.kill());
    return animation;
  }
}
