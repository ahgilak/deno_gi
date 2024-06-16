import Gst from "https://gir.deno.dev/Gst-1.0";
import GstPlay from "https://gir.deno.dev/GstPlay-1.0";
import GLib from "https://gir.deno.dev/GLib-2.0";

Gst.init([]);

const player = GstPlay.Play.new(null);
player.set_uri("http://kolber.github.io/audiojs/demos/mp3/juicy.mp3");

const bus = player.get_message_bus();
bus.add_signal_watch();

bus.connect("message", (_, message) => {
  const play_message = GstPlay.play_message_parse_type(message);

  if (play_message != null) {
    switch (play_message) {
      case GstPlay.PlayMessage.URI_LOADED:
        player.play();
        break;
      case GstPlay.PlayMessage.ERROR:
        console.error(GstPlay.play_message_parse_error(message)[0].toString());
        break;
      case GstPlay.PlayMessage.END_OF_STREAM:
        console.log("bye");
        loop.quit();
        break;
      default:
        // unhandled
        break;
    }
  }
});

const loop = GLib.MainLoop.new(null, false);
loop.run();
