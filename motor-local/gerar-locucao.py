"""Gera locução neural em PT-BR com edge-tts (gratuito, não oficial para uso comercial).

Uso:
  python3 motor-local/gerar-locucao.py "Texto da locução" caminho/saida.mp3 [voz] [velocidade]
  python3 motor-local/gerar-locucao.py --arquivo roteiro.txt caminho/saida.mp3 [voz] [velocidade]
  python3 motor-local/gerar-locucao.py --vozes

Vozes comuns: pt-BR-AntonioNeural (masc.), pt-BR-FranciscaNeural (fem.), pt-BR-ThalitaNeural (fem.)
Velocidade: "+10%", "-5%", "+0%"
"""
import asyncio
import sys
from pathlib import Path

try:
    import edge_tts
except ImportError:
    print("edge-tts não instalado. Rode: pip install -r requirements.txt")
    sys.exit(1)


async def listar_vozes():
    vozes = await edge_tts.list_voices()
    for v in vozes:
        if v["Locale"].startswith("pt-"):
            print(f'{v["ShortName"]:28} {v["Gender"]}')


async def gerar_audio(texto, saida, voz, velocidade):
    Path(saida).parent.mkdir(parents=True, exist_ok=True)
    comunicador = edge_tts.Communicate(texto, voz, rate=velocidade)
    await comunicador.save(saida)
    print(f"Locução gerada em: {saida}")


def main():
    args = sys.argv[1:]
    if args and args[0] == "--vozes":
        asyncio.run(listar_vozes())
        return
    if len(args) >= 2 and args[0] == "--arquivo":
        texto = Path(args[1]).read_text(encoding="utf-8").strip()
        args = args[2:]
    elif len(args) >= 2:
        texto = args[0]
        args = args[1:]
    else:
        print(__doc__)
        sys.exit(1)
    if not args:
        print("Informe o caminho de saída .mp3")
        sys.exit(1)
    saida = args[0]
    voz = args[1] if len(args) > 1 else "pt-BR-AntonioNeural"
    velocidade = args[2] if len(args) > 2 else "+5%"
    try:
        asyncio.run(gerar_audio(texto, saida, voz, velocidade))
    except Exception as err:  # serviço da Microsoft pode cair/mudar
        print(f"Falha no edge-tts: {err}\nAlternativa offline: Piper TTS (https://github.com/rhasspy/piper)")
        sys.exit(1)


if __name__ == "__main__":
    main()
