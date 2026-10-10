/**
 * @vitest-environment jsdom
 *
 * Result screen (verdict, score meter, area cards, strengths, priorities and the
 * closing block): ready and on_track variants, unknowns, eligibility reasons,
 * openness, both languages and the tone rule (never the word "no").
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import ResultScreen from './ResultScreen';
import {
  READINESS_RESULT_ALL_STRONG,
  READINESS_RESULT_ON_TRACK,
  READINESS_RESULT_READY,
} from './readinessFixtures';

const sectionOf = (name) => screen.getByRole('heading', { name }).closest('section');
const CLOSE_TITLE_ES = 'Esto es lo que hacemos con vos en 180 días';

describe('ResultScreen', () => {
  it('shows the ready variant in Spanish with verdict, meter, facts and the six areas', () => {
    render(
      <ResultScreen
        result={READINESS_RESULT_READY}
        lang="es"
        businessName="Vossler Construction"
        facts={{ years: '8', revenue: '250.000 a 500.000', team: '12' }}
      />,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Vossler Construction' })).toBeInTheDocument();
    expect(screen.getByText(/Diagnóstico de tu negocio · 9 de octubre de 2026/)).toBeInTheDocument();
    expect(screen.getByText('Estás preparado para el Método 180.')).toBeInTheDocument();
    expect(screen.getByText('Tenés un negocio en marcha y clientes que confían en tu trabajo.')).toBeInTheDocument();

    const meter = screen.getByRole('img', { name: 'Índice de preparación: 62' });
    expect(meter).toHaveTextContent('62');
    expect(meter).toHaveTextContent('Preparado');
    expect(screen.getByText('Años operando').nextSibling).toHaveTextContent('8');
    expect(screen.getByText('250.000 a 500.000')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();

    expect(screen.getByRole('heading', { level: 3, name: 'Tu información y tus acuerdos' })).toBeInTheDocument();
    expect(screen.getAllByText('sólida')).toHaveLength(2);
    expect(screen.getAllByText('en desarrollo')).toHaveLength(3);
    expect(screen.getByText('por construir')).toBeInTheDocument();
    expect(screen.getAllByText('100%')).toHaveLength(2);
    expect(screen.getByText('17%')).toBeInTheDocument();
    expect(screen.getByText(/Este diagnóstico se preparó con tus respuestas del 9 de octubre de 2026/)).toBeInTheDocument();
  });

  it('hides the facts that were not provided', () => {
    render(<ResultScreen result={READINESS_RESULT_READY} lang="es" />);
    expect(screen.queryByText('Años operando')).not.toBeInTheDocument();
  });

  it('falls back to the document title when the business name is empty', () => {
    render(<ResultScreen result={READINESS_RESULT_READY} lang="es" businessName="" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Ya construiste la base para dar el siguiente paso' })).toBeInTheDocument();
  });

  it('closes with what Strategic Mates does in 180 days and the call to action', () => {
    render(<ResultScreen result={READINESS_RESULT_READY} lang="es" />);

    const section = sectionOf(CLOSE_TITLE_ES);
    ['Ordenamos', 'Preparamos', 'Expandimos'].forEach((title) => {
      expect(within(section).getByRole('heading', { level: 3, name: title })).toBeInTheDocument();
    });
    expect(within(section).getByRole('link', { name: 'Quiero conversar sobre el apadrinamiento' })).toBeInTheDocument();
    expect(within(section).queryByText(/Mientras tanto/)).not.toBeInTheDocument();
  });

  it('lists the two strengths', () => {
    render(<ResultScreen result={READINESS_RESULT_READY} lang="es" />);

    const items = within(sectionOf('Lo que ya tenés a tu favor')).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Tu negocio atiende más trabajo sin perder tiempos ni calidad.');
    expect(items[1]).toHaveTextContent('Tenés pasos claros y revisás el resultado del trabajo.');
  });

  it('lists the priorities in order with title, reading, help and area and no percentages', () => {
    render(<ResultScreen result={READINESS_RESULT_READY} lang="es" />);

    const section = sectionOf('Dónde podemos ayudarte primero');
    const items = within(section).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('01');
    expect(items[0]).toHaveTextContent('Tu dinero');
    expect(items[0]).toHaveTextContent('Hoy falta confirmar cuánto deja el negocio.');
    expect(items[0]).toHaveTextContent('Podemos ordenar la información y revisar costos, precios y flujo de caja.');
    expect(items[0]).toHaveTextContent('Área: El dinero de tu negocio');
    expect(items[1]).toHaveTextContent('Tu tiempo');
    expect(items[2]).toHaveTextContent('Tu expansión');
    expect(section.textContent).not.toMatch(/%/);
  });

  it('shows the unknown topics reassuringly as a quiet note', () => {
    render(<ResultScreen result={READINESS_RESULT_READY} lang="es" />);

    expect(screen.getByText(/las revisamos juntos/)).toBeInTheDocument();
    expect(screen.getByText(/Si se pierde un teléfono o se va alguien del equipo/)).toBeInTheDocument();
  });

  it('hides the unknown note when nothing is unknown', () => {
    render(<ResultScreen result={READINESS_RESULT_ON_TRACK} lang="es" />);
    expect(screen.queryByText(/Pendientes por confirmar/)).not.toBeInTheDocument();
  });

  it('shows the all-strong message instead of priorities', () => {
    render(<ResultScreen result={READINESS_RESULT_ALL_STRONG} lang="es" />);

    const section = sectionOf('Dónde podemos ayudarte primero');
    expect(within(section).queryAllByRole('listitem')).toHaveLength(0);
    expect(section).toHaveTextContent('validar cómo se transfiere tu forma de trabajar');
  });

  it('shows the on_track variant with a kind reason for each eligibility gap above the button', () => {
    render(<ResultScreen result={READINESS_RESULT_ON_TRACK} lang="es" />);

    const section = sectionOf(CLOSE_TITLE_ES);
    expect(screen.getByRole('img', { name: /Índice de preparación/ })).toHaveTextContent('En camino');
    expect(screen.getByText('Ya estás en camino.')).toBeInTheDocument();
    expect(within(section).getByText(/al menos un año de operación/)).toBeInTheDocument();
    expect(within(section).getByText(/ya factura/)).toBeInTheDocument();
    expect(within(section).getByText(/igual podemos acompañarte/)).toBeInTheDocument();
    expect(screen.getByText(/Te mandamos este diagnóstico/)).toBeInTheDocument();
  });

  it('shows only the gap that applies', () => {
    render(<ResultScreen result={{ ...READINESS_RESULT_ON_TRACK, eligibility_gaps: ['revenue'] }} lang="es" />);

    expect(screen.getByText(/ya factura/)).toBeInTheDocument();
    expect(screen.queryByText(/al menos un año de operación/)).not.toBeInTheDocument();
  });

  it('adds the sponsorship explanation when the visitor wants to talk first (openness b)', () => {
    const { unmount } = render(<ResultScreen result={READINESS_RESULT_ON_TRACK} lang="es" />);
    expect(screen.getByText(/Podemos explicarte cómo funciona el apadrinamiento/)).toBeInTheDocument();
    unmount();

    render(<ResultScreen result={READINESS_RESULT_READY} lang="es" />);
    expect(screen.queryByText(/Podemos explicarte cómo funciona el apadrinamiento/)).not.toBeInTheDocument();
  });

  it('flags the follow-up for contracts and permits only when requested', () => {
    const { unmount } = render(<ResultScreen result={READINESS_RESULT_ON_TRACK} lang="es" />);
    expect(screen.getByText(/contratos, permisos y seguros merecen una revisión/)).toBeInTheDocument();
    unmount();

    render(<ResultScreen result={READINESS_RESULT_READY} lang="es" />);
    expect(screen.queryByText(/contratos, permisos y seguros merecen/)).not.toBeInTheDocument();
  });

  it('offers the main call to action as a contact link and the secondary one as a button', () => {
    const onReview = vi.fn();
    render(<ResultScreen result={READINESS_RESULT_READY} lang="es" onReview={onReview} />);

    const link = screen.getByRole('link', { name: 'Quiero conversar sobre el apadrinamiento' });
    expect(link.getAttribute('href')).toMatch(/^mailto:membership@strategicmates\.com\?subject=/);
    fireEvent.click(screen.getByRole('button', { name: 'Volver a mis respuestas' }));
    expect(onReview).toHaveBeenCalledTimes(1);
  });

  it('renders the English copy, labels and server texts', () => {
    render(<ResultScreen result={READINESS_RESULT_READY} lang="en" />);

    expect(screen.getByRole('heading', { level: 1, name: "You've already built the base to take the next step" })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Readiness index: 62' })).toHaveTextContent('Ready');
    expect(screen.getByText('You are ready for the 180 Method.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'This is what we do with you in 180 days' })).toBeInTheDocument();
    expect(screen.getByText('Your time and your team')).toBeInTheDocument();
    expect(screen.getAllByText('solid')).toHaveLength(2);
    expect(screen.getByText('Your money')).toBeInTheDocument();
    expect(screen.getByText('You have clear steps and you check the result of the work.')).toBeInTheDocument();
    expect(screen.getByText(/We will contact you within 48 hours/)).toBeInTheDocument();
    expect(screen.getByText('If a phone is lost or someone leaves the team, can you recover the information and access?', { exact: false })).toBeInTheDocument();
  });

  it('renders the English on_track variant', () => {
    render(<ResultScreen result={READINESS_RESULT_ON_TRACK} lang="en" />);

    expect(screen.getByText('You are on your way.')).toBeInTheDocument();
    expect(screen.getByText(/at least one year of operation/)).toBeInTheDocument();
    expect(screen.getByText(/We can explain how sponsorship works/)).toBeInTheDocument();
  });

  it.each([
    ['es', READINESS_RESULT_READY],
    ['es', READINESS_RESULT_ON_TRACK],
    ['en', READINESS_RESULT_READY],
    ['en', READINESS_RESULT_ON_TRACK],
  ])('never uses the word "no" in the %s result', (lang, result) => {
    const { container } = render(<ResultScreen result={result} lang={lang} />);
    expect(container.textContent).not.toMatch(/(^|[^\p{L}])no([^\p{L}]|$)/iu);
  });
});
